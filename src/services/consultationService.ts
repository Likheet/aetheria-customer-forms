import { supabase } from '../lib/supabase'
import { FormData } from '../types'
import { ConsultationData } from '../lib/supabase'

// Helper function to create AI summary JSON
const createAISummary = (formData: FormData) => {
  return {
    personal_info: {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      age: formData.age,
      gender: formData.gender,
      visit_frequency: formData.visitFrequency
    },
    skin_assessment: {
      skin_type: {
        question: "How would you describe your skin?",
        answer: formData.skinType
      },
      skin_concerns: {
        question: "What are your top 3 skin concerns?",
        answer: formData.skinConcerns
      },
      top_skin_concern: {
        question: "What is your #1 priority out of the above?",
        answer: formData.topSkinConcern
      },
      routine_steps: {
        question: "How many steps are you comfortable with in your routine?",
        answer: formData.routineSteps
      },
      current_products: {
        question: "What skincare products do you currently use?",
        answer: formData.currentProducts
      },
      active_ingredients: {
        question: "Do you use any of the following active ingredients?",
        answer: formData.activeIngredients
      },
      product_reactions: {
        question: "Have you experienced any reactions to products or facials before?",
        answer: formData.productReactions
      },
      facial_frequency: {
        question: "How often do you get facials done?",
        answer: formData.facialFrequency
      },
      facial_reactions: {
        question: "Have you ever had a reaction to a facial, skincare product, or treatment?",
        answer: formData.facialReactions
      },
      ...(formData.facialReactionDetails && {
        facial_reaction_details: {
          question: "Please specify what caused the reaction and what symptoms you had:",
          answer: formData.facialReactionDetails
        }
      }),
      skin_treatments: {
        question: "Are you currently undergoing any treatments for your skin?",
        answer: formData.skinTreatments
      },
      ...(formData.skinTreatmentDetails && {
        skin_treatment_details: {
          question: "Please describe your current treatments:",
          answer: formData.skinTreatmentDetails
        }
      }),
      medications: {
        question: "Are you on any medications that may affect your skin (oral/topical)?",
        answer: formData.medications
      },
      ...(formData.medicationOther && {
        medication_other: {
          question: "Please specify other medications:",
          answer: formData.medicationOther
        }
      }),
      skin_conditions: {
        question: "Do you have any of the following skin conditions?",
        answer: formData.skinConditions
      },
      ...(formData.skinConditionOther && {
        skin_condition_other: {
          question: "Please specify other skin conditions:",
          answer: formData.skinConditionOther
        }
      })
    },
    lifestyle: {
      water_intake: {
        question: "How much water do you drink daily?",
        answer: formData.waterIntake
      },
      sleep_hours: {
        question: "How many hours of sleep do you get on average?",
        answer: formData.sleepHours
      },
      sun_exposure: {
        question: "How often are you exposed to sunlight?",
        answer: formData.sunExposure
      },
      pollution_exposure: {
        question: "How often are you exposed to pollution/outdoor environment?",
        answer: formData.pollutionExposure
      }
    },
    hair_assessment: {
      scalp_type: {
        question: "How would you describe your scalp?",
        answer: formData.scalpType
      },
      hair_type: {
        question: "How would you describe your hair?",
        answer: formData.hairType
      },
      hair_concerns: {
        question: "What are your top 3 hair concerns?",
        answer: formData.hairConcerns
      },
      top_hair_concern: {
        question: "What is your #1 priority out of the above?",
        answer: formData.topHairConcern
      },
      wash_frequency: {
        question: "How often do you wash your hair?",
        answer: formData.washFrequency
      },
      hair_products: {
        question: "What products do you use regularly?",
        answer: formData.hairProducts
      },
      hair_treatments: {
        question: "Do you use any of the following treatments?",
        answer: formData.hairTreatments
      },
      hair_reactions: {
        question: "Have you had any reactions to hair treatments or products before?",
        answer: formData.hairReactions
      },
      ...(formData.hairReactionDetails && {
        hair_reaction_details: {
          question: "Please describe the reaction details:",
          answer: formData.hairReactionDetails
        }
      })
    },
    final: {
      data_consent: {
        question: "Are you okay with us saving your analysis and results in our system for progress tracking?",
        answer: formData.dataConsent
      },
      communication_preference: {
        question: "How would you like to receive your consultation results?",
        answer: formData.communicationPreference
      },
      ...(formData.additionalNotes && {
        additional_notes: {
          question: "Additional notes:",
          answer: formData.additionalNotes
        }
      })
    },
    consultation_metadata: {
      submission_date: new Date().toISOString(),
      total_questions: 33,
      completion_time_estimate: "5-7 minutes"
    }
  };
};
export const submitConsultation = async (formData: FormData): Promise<{ success: boolean; error?: string; data?: any; id?: string }> => {
  try {
    // Create AI summary
    const aiSummary = createAISummary(formData);
    
    // Transform FormData to match database schema exactly
    const consultationData: Omit<ConsultationData, 'id' | 'created_at'> = {
      // Basic Information
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      age: formData.age,
      gender: formData.gender,
      visit_frequency: formData.visitFrequency,
      
      // Skin Assessment
      skin_type: formData.skinType,
      skin_concerns: formData.skinConcerns,
      top_skin_concern: formData.topSkinConcern,
      routine_steps: formData.routineSteps,
      current_products: formData.currentProducts,
      active_ingredients: formData.activeIngredients,
      product_reactions: formData.productReactions,
      facial_frequency: formData.facialFrequency,
      facial_reactions: formData.facialReactions,
      facial_reaction_details: formData.facialReactionDetails,
      skin_treatments: formData.skinTreatments,
      skin_treatment_details: formData.skinTreatmentDetails,
      medications: formData.medications,
      medication_other: formData.medicationOther,
      skin_conditions: formData.skinConditions,
      skin_condition_other: formData.skinConditionOther,
      
      // Lifestyle
      water_intake: formData.waterIntake,
      sleep_hours: formData.sleepHours,
      sun_exposure: formData.sunExposure,
      pollution_exposure: formData.pollutionExposure,
      
      // Hair Assessment
      scalp_type: formData.scalpType,
      hair_type: formData.hairType,
      hair_concerns: formData.hairConcerns,
      top_hair_concern: formData.topHairConcern,
      wash_frequency: formData.washFrequency,
      hair_products: formData.hairProducts,
      hair_treatments: formData.hairTreatments,
      hair_reactions: formData.hairReactions,
      hair_reaction_details: formData.hairReactionDetails,
      
      // Final
      data_consent: formData.dataConsent,
      communication_preference: formData.communicationPreference,
      additional_notes: formData.additionalNotes || '',
      
      // AI Summary
      ai_summary: aiSummary
    }

    console.log('Submitting consultation data:', consultationData)

    const { data, error } = await supabase
      .from('consultations')
      .insert([consultationData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    console.log('Consultation submitted successfully:', data)
    return { success: true, data, id: data?.[0]?.id }
  } catch (error) {
    console.error('Error submitting consultation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export const getConsultations = async (): Promise<{ success: boolean; data?: ConsultationData[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching consultations:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export const getConsultationById = async (id: string): Promise<{ success: boolean; data?: ConsultationData; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching consultation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export const getConsultationsByEmail = async (email: string): Promise<{ success: boolean; data?: ConsultationData[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching consultations by email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}