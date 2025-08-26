import { supabase } from '../lib/supabase';
import { ConsultantInputData } from '../lib/supabase';

// Helper: Map for question text and option/classification labels
const EVAL_QUESTIONS = {
  acne_evaluation: {
    observation: 'Current Observations: What is the most prominent acne type?',
    classification: 'Overall Classification: How would you classify the acne?'
  },
  pigmentation: {
    observation: 'Observations: What is the most prominent pigmentation?',
    classification: 'Classification: How would you classify the pigmentation?'
  },
  texture: {
    observation: 'Observations: What is the most prominent texture issue?',
    classification: 'Classification: How would you classify the texture?'
  },
  sensitivity: {
    observation: 'Observations: What is the most prominent sensitivity observation?',
    classification: 'Classification: How would you classify the sensitivity?'
  }
};

const EVAL_LABELS = {
  // Acne
  acne_evaluation: {
    options: {
      acne_occasional: '1–2 occasional pimples only',
      acne_multiple: '3+ visible active pimples',
      acne_whiteheads: 'Pus-filled acne (whiteheads)',
      acne_papules: 'Red bumps (papules)',
      acne_cysts: 'Deep, painful acne (cysts)',
      acne_fungal: 'Small itchy bumps = possible fungal acne'
    },
    classifications: {
      acne_mild: 'Mild',
      acne_moderate: 'Moderate',
      acne_cystic: 'Cystic',
      acne_fungal: 'Fungal'
    }
  },
  // Pigmentation
  pigmentation: {
    options: {
      pig_brown: 'Brown patches/spots',
      pig_pih: 'Redness left after acne',
      pig_rosacea: 'Flushed cheeks (possible rosacea)'
    },
    classifications: {
      pig_class_brown: 'Brown',
      pig_class_red: 'Red',
      pig_class_mixed: 'Mixed'
    }
  },
  // Texture
  texture: {
    options: {
      texture_bumpy: 'Bumpy skin',
      texture_uneven: 'Uneven tone',
      texture_rough: 'Rough/dry feel',
      texture_aging: 'Aging lines',
      texture_buildup: 'Visible product buildup'
    },
    classifications: {
      texture_class_bumpy: 'Bumpy',
      texture_class_aging: 'Aging texture',
      texture_class_barrier: 'Barrier texture'
    }
  },
  // Sensitivity
  sensitivity: {
    options: {
      sens_reactive: 'Reactive to facials or actives',
      sens_red: 'Skin red, warm, itchy',
      sens_thin: 'Thin skin / history of barrier damage',
      sens_rosacea: 'Red cheeks or nose (possibly rosacea)'
    },
    classifications: {
      sens_class_sensitive: 'Sensitive',
      sens_class_reactive: 'Redness/Reactive',
      sens_class_barrier: 'Barrier Damage'
    }
  },
  // Unsuitable Products
  unsuitable_products: {
    unsuitable_niacinamide: "Niacinamide",
    unsuitable_vitaminc: "Vitamin C",
    unsuitable_sa: "Salicylic Acid",
    unsuitable_ga: "Glycolic Acid",
    unsuitable_la: "Lactic Acid",
    unsuitable_retinol: "Retinol / Adapalene",
    unsuitable_aa: "Azelaic Acid",
    unsuitable_ka: "Kojic Acid",
    unsuitable_peptides: "Peptides"
  }
};

export const createConsultantAISummary = (inputData: ConsultantInputData) => {
  // 1. Build Evaluation Summary
  const evaluation = Object.entries(inputData.evaluation || {}).map(([key, value]) => {
    const q = EVAL_QUESTIONS[key as keyof typeof EVAL_QUESTIONS];
    const l = EVAL_LABELS[key as keyof typeof EVAL_LABELS];
    return q && l && value.checked?.[0] && value.classification ? {
      topic: key.replace('_evaluation', ''),
      question: q.observation,
      answer: ('options' in l ? l.options[value.checked[0] as keyof typeof l.options] : value.checked[0]),
      observation: value.checked[0], // Raw ID of the observation 
      classification: ('classifications' in l ? l.classifications[value.classification as keyof typeof l.classifications] : value.classification)
    } : null;
  }).filter(Boolean); // Filter out any null entries

  // 2. Build Skin Analysis Summary
  const skinAnalysis = {
    skin_type_confirmation: {
      question: "Consultant's confirmation of customer's skin type",
      answer: inputData.skin_analysis.skin_type_confirmation || 'Not provided'
    },
    additional_skin_concerns: {
      question: "Additional skin concerns noted by consultant",
      answer: inputData.skin_analysis.additional_skin_concerns.length > 0 ? inputData.skin_analysis.additional_skin_concerns : 'None'
    },
    recommended_treatments: {
      question: "Recommended in-clinic treatments",
      answer: inputData.skin_analysis.recommended_treatments.length > 0 ? inputData.skin_analysis.recommended_treatments : 'None'
    },
    contraindications: {
      question: "Contraindications or allergies noted",
      answer: inputData.skin_analysis.contraindications.length > 0 ? inputData.skin_analysis.contraindications : 'None'
    },
    patch_test: {
      question: "Is a patch test required?",
      answer: inputData.skin_analysis.patch_test_required ? 'Yes' : 'No',
      notes: inputData.skin_analysis.patch_test_notes || ''
    }
  };

  // 3. Build Unsuitable Products Summary
  const unsuitableProducts = {
    question: "Which products has the customer had issues with, according to the consultant?",
    answer: inputData.unsuitable_products.map(id => EVAL_LABELS.unsuitable_products[id as keyof typeof EVAL_LABELS.unsuitable_products] || id)
  };

  // 4. Staff & Follow-up Information
  const staffInformation = {
    staff_member: {
      question: "Name of the staff member who filled the form",
      answer: inputData.staff_member
    },
    staff_notes: {
      question: "Internal staff notes",
      answer: inputData.staff_notes || 'No notes provided'
    },
    follow_up: {
      question: "Is a follow-up required?",
      answer: inputData.follow_up_required ? 'Yes' : 'No',
      date: inputData.follow_up_date || null
    }
  };

  // 5. Final Assembly
  return {
    metadata: {
      summary_version: '1.1.0',
      consultation_id: inputData.consultation_id,
      created_at: new Date().toISOString()
    },
    customer_info: {
      name: inputData.customer_name,
      phone: inputData.customer_phone,
    },
    consultant_evaluation: evaluation,
    unsuitable_products: unsuitableProducts,
    skin_analysis: skinAnalysis,
    // These are kept as-is but could be expanded in the future
    product_recommendations: inputData.product_recommendations,
    treatment_plan: inputData.treatment_plan,
    staff_information: staffInformation
  };
};

export const submitConsultantInput = async (inputData: ConsultantInputData): Promise<{ success: boolean; error?: string; data?: any }> => {
  // Clean consultation_date: send null if empty string
  const ai_summary = createConsultantAISummary(inputData);
  const cleanedInputData = {
    ...inputData,
    ai_summary,
    consultation_date: inputData.consultation_date && inputData.consultation_date !== '' ? inputData.consultation_date : null,
    // Ensure follow_up_date is null if not required or empty
    follow_up_date:
      !inputData.follow_up_required || !inputData.follow_up_date
        ? null
        : inputData.follow_up_date,
  };
  try {
    const { data, error } = await supabase
      .from('consultant_inputs')
      .insert([cleanedInputData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('Consultant input submitted successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error submitting consultant input:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getConsultantInputs = async (): Promise<{ success: boolean; data?: ConsultantInputData[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('consultant_inputs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching consultant inputs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getConsultantInputById = async (id: string): Promise<{ success: boolean; data?: ConsultantInputData; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('consultant_inputs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching consultant input:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
};

export const getConsultationsWithoutInput = async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    // This query now gets consultations from the dedicated view
    const { data, error } = await supabase
      .from('consultations_without_input')
      .select('id, name, phone, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching consultations without input:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}; 