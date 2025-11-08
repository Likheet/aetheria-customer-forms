/**
 * Products Validators
 * Validation logic for step 17: Current Products
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ProductItem {
  name: string;
  duration: string;
}

/**
 * Validates current products list (Step 17)
 * Requirements:
 * - At least one product
 * - Each product must have name and duration
 */
export function validateCurrentProducts(
  currentProductsList: ProductItem[]
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!currentProductsList || currentProductsList.length === 0) {
    errors.currentProductsList = 'Please add at least one product';
  } else {
    const hasIncompleteProducts = currentProductsList.some(
      (product) => !product.name.trim() || !product.duration.trim()
    );

    if (hasIncompleteProducts) {
      errors.currentProductsList = 'Please fill in all product names and durations';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
