export type AcneCategory =
  | 'Comedonal acne'
  | 'Inflammatory acne'
  | 'Cystic acne'
  | 'Hormonal acne';

export interface AcneBreakoutDetail {
  type: string;
  severity: string;
  category: AcneCategory;
}

export interface UpdatedConsultData {
  // Personal Information  
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  
  // Section 0 - Gates
  pregnancy: string;
  recentIsotretinoin: string;
  severeCysticAcne: string;
  allergyConflict: string;
  barrierStressHigh: string;
  gateActions: string; // Stores all triggered gate actions
  
  // Section A – Skin Basics
  skinType: string;
  skinTypeFlag?: string; // Derived flag from skinType selection (e.g., 'Oily', 'Combination', 'Dry')
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
  // Ordered prioritization of selected concerns (labels as shown in UI)
  concernPriority?: string[];
  acneBreakouts: AcneBreakoutDetail[];
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

