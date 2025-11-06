/**
 * Step Components - Form flow steps exported for clean imports
 * Organized by form section
 */

// Phase 1: Personal Info + Safety Gates
export {
  NameStep,
  PhoneStep,
  DateOfBirthStep,
  GenderStep,
} from './PersonalInfoSteps';

export {
  PregnancyStep,
  BreastfeedingStep,
  AllergiesStep,
  MedicationsStep,
  HealthConditionsStep,
} from './SafetyGateSteps';

// Phase 2: Skin Basics + Sensitivity
export {
  SkinTypeStep,
  OilLevelsStep,
  HydrationLevelsStep,
} from './SkinBasicsSteps';

export { SensitivityScreeningStep } from './SensitivityScreeningStep';

// Phase 3: History + Products + Main Concerns
export {
  DiagnosedConditionsStep,
  PrescriptionTreatmentsStep,
  ProfessionalTreatmentsStep,
} from './HistorySteps';

export { CurrentProductsStep } from './CurrentProductsStep';

export { IrritatingProductsStep } from './IrritatingProductsStep';

export { MainConcernsStep } from './MainConcernsStep';

// Phase 4: Concern Priority
export { ConcernPriorityStep } from './ConcernPriorityStep';

// Phase 5: Preferences + Legal
export {
  RoutineStepsStep,
  SerumComfortStep,
  LegalDisclaimerStep,
} from './PreferencesAndLegalSteps';
