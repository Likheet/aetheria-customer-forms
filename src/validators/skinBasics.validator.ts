/**
 * Skin Basics Validators
 * Validation logic for steps 10-13: Skin Type, Oil Levels, Hydration, Sensitivity
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates skin type (Step 10)
 */
export function validateSkinType(skinType: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!skinType.trim()) {
    errors.skinType = 'Skin type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates oil levels (Step 11)
 */
export function validateOilLevels(oilLevels: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!oilLevels.trim()) {
    errors.oilLevels = 'Oil level description is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates hydration levels (Step 12)
 */
export function validateHydrationLevels(hydrationLevels: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!hydrationLevels.trim()) {
    errors.hydrationLevels = 'Hydration level description is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates sensitivity screening questions (Step 13)
 * @param formData Object containing all sensitivity field keys and values
 * @param sensitivityFields Array of field keys to validate
 */
export function validateSensitivityScreening(
  formData: Record<string, any>,
  sensitivityFields: string[]
): ValidationResult {
  const errors: Record<string, string> = {};

  sensitivityFields.forEach((key) => {
    const val = formData[key] as string;
    if (!val || !val.trim()) {
      errors[key] = 'Please select an option';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates all skin basics fields together
 */
export function validateSkinBasics(data: {
  skinType: string;
  oilLevels: string;
  hydrationLevels: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const skinTypeResult = validateSkinType(data.skinType);
  const oilResult = validateOilLevels(data.oilLevels);
  const hydrationResult = validateHydrationLevels(data.hydrationLevels);

  return {
    isValid: skinTypeResult.isValid && oilResult.isValid && hydrationResult.isValid,
    errors: {
      ...skinTypeResult.errors,
      ...oilResult.errors,
      ...hydrationResult.errors,
    },
  };
}
