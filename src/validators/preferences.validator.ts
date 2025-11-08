/**
 * Preferences Validators
 * Validation logic for routine steps and serum comfort preferences
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates routine steps preference
 */
export function validateRoutineSteps(routineSteps: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!routineSteps.trim()) {
    errors.routineSteps = 'Please select your preferred routine steps';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates serum comfort level
 */
export function validateSerumComfort(serumComfort: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!serumComfort.trim()) {
    errors.serumComfort = 'Please select your serum comfort level';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates all preference fields together
 */
export function validatePreferences(data: {
  routineSteps: string;
  serumComfort: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const routineResult = validateRoutineSteps(data.routineSteps);
  const serumResult = validateSerumComfort(data.serumComfort);

  return {
    isValid: routineResult.isValid && serumResult.isValid,
    errors: {
      ...routineResult.errors,
      ...serumResult.errors,
    },
  };
}
