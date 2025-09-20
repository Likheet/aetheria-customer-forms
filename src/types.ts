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
  acneSeverity: string;
  acneCategory: string;
  acneDuration: string;
  pigmentationType: string;
  pigmentationSeverity: string;
  pigmentationDuration: string;
  rednessType: string;
  rednessDuration: string;
  dullnessType: string;
  dullnessDuration: string;
  wrinklesType: string;
  wrinklesDuration: string;
  poresType: string;
  poresDuration: string;
  textureType: string;
  textureDuration: string;
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
  // Decision engine outcomes
  triageOutcomes?: any[];
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

