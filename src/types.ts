import { ConsultantInputData } from "./lib/supabase";

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