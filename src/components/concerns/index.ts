/**
 * Concern Components - Specialized steps for each main concern
 * Exported from concerns/ directory for clean imports
 */

// Acne concern (type + severity per breakout)
export { AcneTypeStep, AcneSeverityStep } from './AcneConcernSteps';

// Pigmentation concern (type: Red/Brown + severity)
export { PigmentationTypeStep, PigmentationSeverityStep } from './PigmentationConcernSteps';

// Post Acne Scarring concern (type + severity/color)
export { ScarringTypeStep, ScarringSeverityStep } from './ScarringConcernSteps';

// Simple concerns (direct severity selection)
export { WrinklesStep, PoresStep, TextureStep } from './SimpleConcernSteps';
