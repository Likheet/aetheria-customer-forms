/**
 * Safety Gates Validators
 * Validation logic for steps 5-9: Pregnancy, Isotretinoin, Severe Acne, Allergies, Barrier Stress
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates pregnancy question (Step 5)
 * Note: Males automatically skip this validation
 */
export function validatePregnancy(pregnancy: string, gender: string): ValidationResult {
  const errors: Record<string, string> = {};

  // Skip validation for males
  if (gender !== 'Male') {
    if (!pregnancy || pregnancy.trim() === '') {
      errors.pregnancy = 'Please answer the pregnancy question';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates recent isotretinoin use (Step 6)
 */
export function validateIsotretinoin(recentIsotretinoin: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!recentIsotretinoin || recentIsotretinoin.trim() === '') {
    errors.recentIsotretinoin = 'Please answer the isotretinoin question';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates severe cystic acne question (Step 7)
 */
export function validateSevereCysticAcne(severeCysticAcne: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!severeCysticAcne || severeCysticAcne.trim() === '') {
    errors.severeCysticAcne = 'Please answer the severe acne question';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates allergy conflicts (Step 8)
 */
export function validateAllergyConflict(allergyConflict: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!allergyConflict || allergyConflict.trim() === '') {
    errors.allergyConflict = 'Please answer the allergies question';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates barrier stress question (Step 9)
 */
export function validateBarrierStress(barrierStressHigh: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!barrierStressHigh || barrierStressHigh.trim() === '') {
    errors.barrierStressHigh = 'Please answer the barrier stress question';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates all safety gate fields together
 */
export function validateSafetyGates(data: {
  pregnancy: string;
  recentIsotretinoin: string;
  severeCysticAcne: string;
  allergyConflict: string;
  barrierStressHigh: string;
  gender: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const pregnancyResult = validatePregnancy(data.pregnancy, data.gender);
  const isotretinoinResult = validateIsotretinoin(data.recentIsotretinoin);
  const acneResult = validateSevereCysticAcne(data.severeCysticAcne);
  const allergyResult = validateAllergyConflict(data.allergyConflict);
  const barrierResult = validateBarrierStress(data.barrierStressHigh);

  return {
    isValid:
      pregnancyResult.isValid &&
      isotretinoinResult.isValid &&
      acneResult.isValid &&
      allergyResult.isValid &&
      barrierResult.isValid,
    errors: {
      ...pregnancyResult.errors,
      ...isotretinoinResult.errors,
      ...acneResult.errors,
      ...allergyResult.errors,
      ...barrierResult.errors,
    },
  };
}
