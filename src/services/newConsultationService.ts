import { supabase } from '../lib/supabase'
import { UpdatedConsultData } from '../types'

// Types for the new database structure
export interface Customer {
  id?: string
  full_name: string
  phone_e164: string
  dob?: string
  gender?: string
  created_at?: string
  updated_at?: string
}

export interface AssessmentSession {
  id?: string
  customer_id: string
  tz?: string
  location?: string
  staff_id?: string
  created_at?: string
}

export interface IntakeForm {
  id?: string
  session_id: string
  form_version?: string
  answers: any // JSONB
  raw?: any // JSONB
  created_at?: string
}

// Format phone number to E.164 format (enhanced)
function formatPhoneToE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/[^0-9]/g, '')
  
  // Indian mobile number (10 digits starting with 6-9)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`
  }
  
  // 12 digits starting with 91 (Indian number with country code)
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`
  }
  
  // Already properly formatted with +
  if (phone.startsWith('+') && /^\+[1-9]\d{1,14}$/.test(phone)) {
    return phone
  }
  
  // Other country codes or international numbers
  if (digits.length > 10 && /^[1-9]/.test(digits)) {
    return `+${digits}`
  }
  
  // Default: assume Indian mobile if 10 digits
  if (digits.length === 10) {
    return `+91${digits}`
  }
  
  // Return original if can't format properly
  return phone
}

// Utility function to convert empty strings to NULL (following DB best practices)
function normalizeValue(value: any): any {
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  if (Array.isArray(value) && value.length === 0) {
    return null
  }
  return value
}

// Utility function to normalize object properties
function normalizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  
  const normalized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    normalized[key] = normalizeValue(value)
  }
  return normalized
}

// Transform form data into normalized structure
function transformFormData(formData: UpdatedConsultData & { triageOutcomes?: any[] }) {
  return {
    skin_profile: {
      skin_type: normalizeValue(formData.skinType),
      oil_levels: normalizeValue(formData.oilLevels),
      hydration_levels: normalizeValue(formData.hydrationLevels),
      sensitivity: normalizeValue(formData.sensitivity),
      sensitivity_triggers: normalizeValue(formData.sensitivityTriggers),
      main_concerns: normalizeValue(formData.mainConcerns),
      // Include concern-specific data
      acne_type: normalizeValue(formData.acneType),
      acne_duration: normalizeValue(formData.acneDuration),
      pigmentation_type: normalizeValue(formData.pigmentationType),
      pigmentation_duration: normalizeValue(formData.pigmentationDuration),
      redness_type: normalizeValue(formData.rednessType),
      redness_duration: normalizeValue(formData.rednessDuration),
      dullness_type: normalizeValue(formData.dullnessType),
      dullness_duration: normalizeValue(formData.dullnessDuration),
      wrinkles_type: normalizeValue(formData.wrinklesType),
      wrinkles_duration: normalizeValue(formData.wrinklesDuration),
      pores_type: normalizeValue(formData.poresType),
      pores_duration: normalizeValue(formData.poresDuration),
      oiliness_type: normalizeValue(formData.oilinessType),
      oiliness_duration: normalizeValue(formData.oilinessDuration),
      dryness_type: normalizeValue(formData.drynessType),
      dryness_duration: normalizeValue(formData.drynessDuration),
      // Sensitivity questions
      sensitivity_redness: normalizeValue(formData.sensitivityRedness),
      sensitivity_diagnosis: normalizeValue(formData.sensitivityDiagnosis),
      sensitivity_cleansing: normalizeValue(formData.sensitivityCleansing),
      sensitivity_products: normalizeValue(formData.sensitivityProducts),
      sensitivity_sun: normalizeValue(formData.sensitivitySun),
      sensitivity_capillaries: normalizeValue(formData.sensitivityCapillaries),
      sensitivity_seasonal: normalizeValue(formData.sensitivitySeasonal),
    },
    skin_history: {
      diagnosed_conditions: normalizeValue(formData.diagnosedConditions),
      prescription_treatments: normalizeValue(formData.prescriptionTreatments),
      professional_treatments: normalizeValue(formData.professionalTreatments),
    },
    lifestyle: {
      diet: normalizeValue(formData.diet),
      water_intake: normalizeValue(formData.waterIntake),
      sleep_hours: normalizeValue(formData.sleepHours),
      stress_levels: normalizeValue(formData.stressLevels),
      environment: normalizeValue(formData.environment),
    },
    product_usage: {
      current_products: normalizeValue(formData.currentProducts),
      current_products_list: normalizeValue(formData.currentProductsList),
      product_duration: normalizeValue(formData.productDuration),
      irritating_products: normalizeValue(formData.irritatingProducts),
      // New: structured list for products that caused reactions
      product_reactions_list: normalizeValue(
        (formData as any).productReactionsList
          ? (formData as any).productReactionsList
          : (formData.irritatingProducts ? formData.irritatingProducts.split(',').map((s: string) => s.trim()).filter(Boolean) : null)
      ),
      allergies: normalizeValue(formData.allergies),
      medications: normalizeValue(formData.medications),
      pregnancy_breastfeeding: normalizeValue(formData.pregnancyBreastfeeding),
    },
    preferences: {
      routine_steps: normalizeValue(formData.routineSteps),
      serum_comfort: normalizeValue(formData.serumComfort),
      moisturizer_texture: normalizeValue(formData.moisturizerTexture),
      brand_preference: normalizeValue(formData.brandPreference),
      budget: normalizeValue(formData.budget),
    },
    evaluation: {
      triage: (formData as any).triageOutcomes ?? null
    }
  }
}

// Save consultation data to the database
export async function saveConsultationData(
  formData: UpdatedConsultData & { triageOutcomes?: any[] },
  opts?: { sessionId?: string }
): Promise<string> {
  try {
    const passedSessionId = opts?.sessionId
    let sessionIdToUse: string | null = null
    let customerIdToUse: string | null = null

    if (passedSessionId) {
      // Reuse existing session; fetch to validate and get customer_id
      const { data: existingSession, error: sessErr } = await supabase
        .from('assessment_session')
        .select('id, customer_id')
        .eq('id', passedSessionId)
        .maybeSingle()
      if (sessErr) {
        console.error('Session fetch error:', sessErr)
        throw new Error('Failed to fetch existing session')
      }
      if (!existingSession) {
        throw new Error('Provided session not found')
      }
      sessionIdToUse = existingSession.id as string
      customerIdToUse = (existingSession as any).customer_id as string
    } else {
      // Format phone number
      const phoneE164 = formatPhoneToE164(formData.phoneNumber)
      // 1. Upsert customer data
      const { data: customer, error: customerError } = await supabase
        .from('customer')
        .upsert({
          full_name: normalizeValue(formData.name),
          phone_e164: phoneE164,
          dob: normalizeValue(formData.dateOfBirth),
          gender: normalizeValue(formData.gender),
        }, { 
          onConflict: 'phone_e164',
          ignoreDuplicates: false 
        })
        .select('id')
        .single()

      if (customerError) {
        console.error('Customer upsert error:', customerError)
        throw new Error('Failed to save customer data')
      }

      if (!customer?.id) {
        throw new Error('Customer ID not returned')
      }
      customerIdToUse = customer.id

      // 2. Create new assessment session
      const { data: session, error: sessionError } = await supabase
        .from('assessment_session')
        .insert({
          customer_id: customer.id,
          tz: 'Asia/Kolkata', // You can make this dynamic later
          location: null, // Add location field to form if needed
          staff_id: null, // Add staff tracking if needed
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        throw new Error('Failed to create assessment session')
      }

      if (!session?.id) {
        throw new Error('Session ID not returned')
      }
      sessionIdToUse = session.id as string
    }

    // 3. Transform and save intake form data
    const transformedAnswers = transformFormData(formData)
    
    const { data: intakeForm, error: intakeError } = await supabase
      .from('intake_form')
      .insert({
        session_id: sessionIdToUse!,
        form_version: '1.0',
        answers: transformedAnswers,
        raw: normalizeObject(formData), // Store normalized form data as backup
      })
      .select('id')
      .single()

    if (intakeError) {
      console.error('Intake form save error:', intakeError)
      throw new Error('Failed to save intake form')
    }

    console.log('Consultation data saved successfully:', {
      customer_id: customerIdToUse,
      session_id: sessionIdToUse,
      intake_form_id: intakeForm?.id
    })

    return sessionIdToUse!
    
  } catch (error) {
    console.error('Error saving consultation data:', error)
    throw error
  }
}

// Get customer's consultation history
export async function getCustomerHistory(phone: string): Promise<any[]> {
  try {
    const phoneE164 = formatPhoneToE164(phone)
    
    const { data, error } = await supabase
      .from('customer')
      .select(`
        id,
        full_name,
        phone_e164,
        created_at,
        assessment_session!inner (
          id,
          created_at,
          intake_form (
            id,
            form_version,
            answers,
            created_at
          )
        )
      `)
      .eq('phone_e164', phoneE164)
      .order('assessment_session(created_at)', { ascending: false })

    if (error) {
      console.error('Error fetching customer history:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getCustomerHistory:', error)
    throw error
  }
}

// Get all recent consultation sessions for client selection
export async function getRecentConsultationSessions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    // First, let's get assessment sessions with customer info
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_session')
      .select(`
        id,
        created_at,
        location,
        customer_id
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (sessionError) {
      console.error('Error fetching assessment sessions:', sessionError)
      return { success: false, error: sessionError.message }
    }

    if (!sessionData || sessionData.length === 0) {
      return { success: true, data: [] }
    }

    // Get customer details for each session
    const customerIds = sessionData.map(session => session.customer_id).filter(Boolean)
    
    const { data: customerData, error: customerError } = await supabase
      .from('customer')
      .select('id, full_name, phone_e164')
      .in('id', customerIds)

    if (customerError) {
      console.error('Error fetching customers:', customerError)
      return { success: false, error: customerError.message }
    }

    // Create a map of customers by ID
    const customerMap = new Map(customerData?.map(customer => [customer.id, customer]) || [])

    // Transform data to match expected format for client selection
    const transformedData = sessionData.map(session => {
      const customer = customerMap.get(session.customer_id)
      return {
        session_id: session.id,
        customer_id: session.customer_id,
        customer_name: customer?.full_name || 'Unknown Customer',
        customer_phone: customer?.phone_e164 || '',
        created_at: session.created_at,
        location: session.location || '',
        answers: null // We can add this later if needed
      }
    })

    return { success: true, data: transformedData }
  } catch (error) {
    console.error('Error in getRecentConsultationSessions:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

// Sessions ready to fill: machine scan exists, no intake form yet
export async function getFillingQueue() {
  const { data: sessions, error } = await supabase
    .from('assessment_session')
    .select('id, created_at, location, customer:customer_id ( id, full_name, phone_e164 )')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error

  const sessionIds = (sessions || []).map((s: any) => s.id)
  if (!sessionIds.length) return []

  const { data: scans } = await supabase
    .from('machine_scan')
    .select('id, session_id')
    .in('session_id', sessionIds)

  const scanSessionIds = new Set((scans || []).map((s: any) => s.session_id))

  const { data: intake } = await supabase
    .from('intake_form')
    .select('session_id')
    .in('session_id', sessionIds)

  const filledSessionIds = new Set((intake || []).map((i: any) => i.session_id))

  return (sessions || [])
    .filter((s: any) => scanSessionIds.has(s.id) && !filledSessionIds.has(s.id))
    .map((s: any) => ({
      session_id: s.id,
      created_at: s.created_at,
      location: s.location || '',
      customer_id: s.customer?.id,
      customer_name: s.customer?.full_name || 'Unknown',
      customer_phone: s.customer?.phone_e164 || '',
    }))
}

// Load one session “profile” with flattened machine metrics
export async function getSessionProfile(sessionId: string) {
  const { data: session, error: sesErr } = await supabase
    .from('assessment_session')
    .select('id, customer:customer_id(id, full_name, phone_e164), machine_scan:machine_scan(id)')
    .eq('id', sessionId)
    .single()
  if (sesErr) throw sesErr
  if (!(session as any)?.machine_scan?.id) throw new Error('No machine_scan for this session')

  const scanId = (session as any).machine_scan.id as string

  const { data: ma, error: maErr } = await supabase
    .from('machine_analysis')
    .select(`
      scan_id, skin_age,
      moisture, moisture_band,
      sebum, sebum_band,
      texture, texture_band,
      pigmentation_uv, pigmentation_uv_band,
      redness, redness_band,
      pores, pores_band,
      acne, acne_band,
      uv_spots, uv_spots_band,
      brown_areas, brown_areas_band,
      sensitivity, sensitivity_band
    `)
    .eq('scan_id', scanId)
    .maybeSingle()
  if (maErr) throw maErr

  return {
    session_id: sessionId,
    customer_id: (session as any).customer?.id,
    customer_name: (session as any).customer?.full_name,
    customer_phone: (session as any).customer?.phone_e164,
    scan_id: scanId,
    metrics: ma || null,
  }
}
