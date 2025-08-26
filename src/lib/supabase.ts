import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types that match the actual schema
export interface ConsultationData {
  id?: string
  created_at?: string
  
  // Basic Information
  name: string
  phone: string
  email: string
  age: string
  gender: string
  visit_frequency: string
  
  // Treatment Type
  treatment_type: 'Skin Only' | 'Hair Only' | 'Both';
  
  // Skin Assessment
  skin_type: string
  skin_concerns: string[]
  top_skin_concern: string
  routine_steps: string
  current_products: {
    cleanser: string
    toner: string
    serum: string
    moisturizer: string
    sunscreen: string
    exfoliator: string
    faceMasks: string
  }
  active_ingredients: string[]
  product_reactions: string
  facial_frequency: string
  facial_reactions: string
  facial_reaction_details: string
  skin_treatments: string
  skin_treatment_details: string
  medications: string[]
  medication_other: string
  skin_conditions: string[]
  skin_condition_other: string
  
  // Lifestyle
  water_intake: string
  sleep_hours: string
  sun_exposure: string
  pollution_exposure: string
  
  // Hair Assessment
  scalp_type: string
  hair_type: string[]
  hair_concerns: string[]
  top_hair_concern: string
  wash_frequency: string
  hair_products: {
    shampoo: string
    conditioner: string
    hairMask: string
    hairSerum: string
    scalpTonics: string
    stylingProducts: string
  }
  hair_treatments: string[]
  hair_reactions: string
  hair_reaction_details: string
  
  // Final
  data_consent: string
  communication_preference: string
  additional_notes?: string
  
  // AI Summary
  ai_summary?: {
    personal_info: {
      name: string
      phone: string
      email: string
      age: string
      gender: string
      visit_frequency: string
    }
    skin_assessment: {
      skin_type: { question: string; answer: string }
      skin_concerns: { question: string; answer: string[] }
      top_skin_concern: { question: string; answer: string }
      routine_steps: { question: string; answer: string }
      current_products: { question: string; answer: object }
      active_ingredients: { question: string; answer: string[] }
      product_reactions: { question: string; answer: string }
      facial_frequency: { question: string; answer: string }
      facial_reactions: { question: string; answer: string }
      facial_reaction_details?: { question: string; answer: string }
      skin_treatments: { question: string; answer: string }
      skin_treatment_details?: { question: string; answer: string }
      medications: { question: string; answer: string[] }
      medication_other?: { question: string; answer: string }
      skin_conditions: { question: string; answer: string[] }
      skin_condition_other?: { question: string; answer: string }
    }
    lifestyle: {
      water_intake: { question: string; answer: string }
      sleep_hours: { question: string; answer: string }
      sun_exposure: { question: string; answer: string }
      pollution_exposure: { question: string; answer: string }
    }
    hair_assessment: {
      scalp_type: { question: string; answer: string }
      hair_type: { question: string; answer: string[] }
      hair_concerns: { question: string; answer: string[] }
      top_hair_concern: { question: string; answer: string }
      wash_frequency: { question: string; answer: string }
      hair_products: { question: string; answer: object }
      hair_treatments: { question: string; answer: string[] }
      hair_reactions: { question: string; answer: string }
      hair_reaction_details?: { question: string; answer: string }
    }
    final: {
      data_consent: { question: string; answer: string }
      communication_preference: { question: string; answer: string }
      additional_notes?: { question: string; answer: string }
    }
    consultation_metadata: {
      submission_date: string
      total_questions: number
      completion_time_estimate: string
    }
  }
}

export interface ConsultantInputData {
  id?: string;
  created_at?: string;
  consultation_id: string;
  customer_name: string;
  customer_phone: string;
  
  // Evaluation
  evaluation: { [key: string]: any };
  unsuitable_products: string[];
  
  // Skin Analysis
  skin_analysis: {
    skin_type_confirmation: string;
    additional_skin_concerns: string[];
    recommended_treatments: string[];
    contraindications: string[];
    patch_test_required: boolean;
    patch_test_notes?: string;
  };
  
  // Product Recommendations
  product_recommendations: {
    cleanser: string;
    toner: string;
    serum: string[];
    moisturizer: string;
    sunscreen: string;
    treatments: string[];
    masks: string[];
  };
  
  // Treatment Plan
  treatment_plan: {
    immediate_treatments: string[];
    future_treatments: string[];
    treatment_frequency: string;
    special_considerations: string;
  };
  
  // Notes
  staff_notes: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  
  // Staff Info
  staff_member: string;
  consultation_date: string;
}