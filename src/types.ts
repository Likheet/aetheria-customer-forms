export interface UpdatedConsultData {
  // Personal Information  
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  
  // Section A – Skin Basics
  skinType: string;
  oilLevels: string;
  hydrationLevels: string;
  sensitivity: string;
  sensitivityTriggers?: string;
  
  // Section B – Current Skin History
  diagnosedConditions: string;
  prescriptionTreatments: string;
  professionalTreatments: string;
  
  // Section C – Current Routine
  currentProducts: string;
  currentProductsList: Array<{ name: string; duration: string }>;
  productDuration: string;
  irritatingProducts: string;
  
  // Section D – Main Concerns
  mainConcerns: string[];
  acneType: string;
  acneDuration: string;
  pigmentationType: string;
  pigmentationDuration: string;
  rednessType: string;
  rednessDuration: string;
  dullnessType: string;
  dullnessDuration: string;
  wrinklesType: string;
  wrinklesDuration: string;
  poresType: string;
  poresDuration: string;
  oilinessType: string;
  oilinessDuration: string;
  drynessType: string;
  drynessDuration: string;
  
  // Sensitivity questions
  sensitivityRedness: string;
  sensitivityDiagnosis: string;
  sensitivityCleansing: string;
  sensitivityProducts: string;
  sensitivitySun: string;
  sensitivityCapillaries: string;
  sensitivitySeasonal: string;
  
  // Section E - Lifestyle Inputs
  diet: string;
  waterIntake: string;
  sleepHours: string;
  stressLevels: string;
  environment: string;
  
  // Section F - Willingness & Preferences
  routineSteps: string;
  serumComfort: string;
  moisturizerTexture: string;
  brandPreference: string;
  budget: string;
  
  // Additional fields that might be missing
  allergies: string;
  pregnancyBreastfeeding: string;
  medications: string;
}

export interface FormData {
  // Basic Information
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  visitFrequency: string;

  // Skin Assessment
  skinType: string;
  skinConcerns: string[];
  topSkinConcern: string;
  routineSteps: string;
  currentProducts: {
    cleanser: string;
    toner: string;
    serum: string;
    moisturizer: string;
    sunscreen: string;
    exfoliator: string;
    faceMasks: string;
  };
  activeIngredients: string[];
  productReactions: string;
  facialFrequency: string;
  facialReactions: string;
  facialReactionDetails: string;
  skinTreatments: string;
  skinTreatmentDetails: string;
  medications: string[];
  medicationOther: string;
  skinConditions: string[];
  skinConditionOther: string;

  // Lifestyle
  waterIntake: string;
  sleepHours: string;
  sunExposure: string;
  pollutionExposure: string;

  // Hair Assessment
  scalpType: string;
  hairType: string[];
  hairConcerns: string[];
  topHairConcern: string;
  washFrequency: string;
  hairProducts: {
    shampoo: string;
    conditioner: string;
    hairMask: string;
    hairSerum: string;
    scalpTonics: string;
    stylingProducts: string;
  };
  hairTreatments: string[];
  hairReactions: string;
  hairReactionDetails: string;

  // Final
  dataConsent: string;
  communicationPreference: string;
  additionalNotes?: string;
  evaluation?: any;
  staff_notes?: string;
  staff_member?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

export interface StepProps {
  formData: any;
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
  field?: string;
  onGoHome?: () => void;
}