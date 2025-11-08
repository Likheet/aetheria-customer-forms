/**
 * Legal Disclaimers Validator
 * Validation logic for legal disclaimer checkboxes
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates legal disclaimers
 * Requirements: All disclaimer checkboxes must be checked
 *
 * @param formData Object containing all legal disclaimer keys
 * @param legalDisclaimerKeys Array of legal disclaimer field keys (e.g., ['legalDisclaimer1', 'legalDisclaimer2', ...])
 */
export function validateLegalDisclaimers(
  formData: Record<string, any>,
  legalDisclaimerKeys: string[]
): ValidationResult {
  const errors: Record<string, string> = {};

  const allChecked = legalDisclaimerKeys.every((key) => formData[key] === true);

  if (!allChecked) {
    errors.legalDisclaimerAgreed = 'You must acknowledge all disclaimer points to continue';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
