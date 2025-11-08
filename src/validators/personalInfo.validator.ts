/**
 * Personal Information Validators
 * Validation logic for steps 1-4: Name, Phone, Date of Birth, Gender
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates name field (Step 1)
 */
export function validateName(name: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates phone number (Step 2)
 * Accepts:
 * - E.164 format: +[country code][number] (e.g., +919876543210)
 * - Indian 10-digit: Starting with 6-9 (e.g., 9876543210)
 * - International: 10-15 digits starting with 1-9
 */
export function validatePhone(phoneNumber: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required';
  } else {
    const raw = phoneNumber.trim();
    const digits = raw.replace(/\D/g, '');

    const isE164 = /^\+[1-9]\d{6,14}$/.test(raw);
    const isIndian10 = digits.length === 10 && /^[6-9]/.test(digits);
    const isInternational = digits.length > 10 && /^[1-9]/.test(digits);

    if (!(isE164 || isIndian10 || isInternational)) {
      errors.phoneNumber = 'Enter a valid phone number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates date of birth (Step 3)
 */
export function validateDateOfBirth(dateOfBirth: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!dateOfBirth.trim()) {
    errors.dateOfBirth = 'Date of birth is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates gender (Step 4)
 */
export function validateGender(gender: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!gender.trim()) {
    errors.gender = 'Gender is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates all personal info fields together
 */
export function validatePersonalInfo(data: {
  name: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const nameResult = validateName(data.name);
  const phoneResult = validatePhone(data.phoneNumber);
  const dobResult = validateDateOfBirth(data.dateOfBirth);
  const genderResult = validateGender(data.gender);

  return {
    isValid: nameResult.isValid && phoneResult.isValid && dobResult.isValid && genderResult.isValid,
    errors: {
      ...nameResult.errors,
      ...phoneResult.errors,
      ...dobResult.errors,
      ...genderResult.errors,
    },
  };
}
