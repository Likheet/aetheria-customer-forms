/**
 * Concerns Validators
 * Validation logic for step 19 and dynamic concern steps
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface AcneBreakout {
  type: string;
  severity?: string;
}

/**
 * Validates main concerns selection (Step 19)
 * Requirements:
 * - At least 1 concern
 * - Maximum 3 concerns
 */
export function validateMainConcerns(mainConcerns: string[]): ValidationResult {
  const errors: Record<string, string> = {};

  if (mainConcerns.length === 0) {
    errors.mainConcerns = 'Select at least one main concern';
  }

  if (mainConcerns.length > 3) {
    errors.mainConcerns = 'Please select a maximum of 3 main concerns';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates concern priority ranking
 * Requirements:
 * - All selected concerns must be ranked
 * - Acne must be #1 if selected
 */
export function validateConcernPriority(
  mainConcerns: string[],
  concernPriority: string[]
): ValidationResult {
  const errors: Record<string, string> = {};

  const selected = Array.isArray(mainConcerns) ? mainConcerns : [];
  const order = Array.isArray(concernPriority) ? concernPriority : [];

  const acnePinnedOk = !selected.includes('Acne') || order[0] === 'Acne';
  const coveredAll = selected.every((c) => order.includes(c)) && order.length === selected.length;

  if (!acnePinnedOk) {
    errors.concernPriority = 'Acne must be the top priority when selected.';
  } else if (!coveredAll) {
    errors.concernPriority = 'Please order all selected concerns.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates acne concern type selection
 * Requirement: At least one breakout type must be selected
 */
export function validateAcneType(acneBreakouts: AcneBreakout[]): ValidationResult {
  const errors: Record<string, string> = {};

  const breakouts = Array.isArray(acneBreakouts) ? acneBreakouts : [];

  if (!breakouts.length) {
    errors.acneBreakouts = 'Select at least one breakout type';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates acne concern severity
 * Requirement: Each breakout type must have a severity rating
 */
export function validateAcneSeverity(acneBreakouts: AcneBreakout[]): ValidationResult {
  const errors: Record<string, string> = {};

  const breakouts = Array.isArray(acneBreakouts) ? acneBreakouts : [];

  if (!breakouts.length) {
    errors.acneBreakouts = 'Select at least one breakout type';
  } else if (breakouts.some((item) => !String(item.severity || '').trim())) {
    errors.acneBreakouts = 'Select a severity for each breakout type';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates generic concern field (type or severity)
 * Used for pigmentation, scarring, wrinkles, pores, texture
 */
export function validateConcernField(
  concern: string,
  stepType: 'type' | 'severity',
  value: string
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!value.trim()) {
    errors[`${concern}_${stepType}`] = `${concern} ${stepType === 'severity' ? 'severity' : 'type'} is required`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates Post Acne Scarring concern
 * Special handling for color vs severity based on type
 */
export function validatePostAcneScarring(
  scarringType: string,
  scarringSeverity: string,
  scarringColor: string
): ValidationResult {
  const errors: Record<string, string> = {};

  // Determine if we need color or severity based on type
  if (scarringType.includes('pigmentation') || scarringType.includes('Post-inflammatory')) {
    if (!scarringColor.trim()) {
      errors.postAcneScarringColor = 'Post Acne Scarring color is required';
    }
  } else {
    if (!scarringSeverity.trim()) {
      errors.postAcneScarringSeverity = 'Post Acne Scarring severity is required';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
