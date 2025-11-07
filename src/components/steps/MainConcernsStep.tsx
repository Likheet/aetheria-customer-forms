/**
 * MainConcernsStep - Select up to 3 main skin concerns
 * Replaces UpdatedConsultForm.tsx step 19 (lines 3568-3618)
 *
 * OLD: ~50 lines with hard-coded checkbox styling
 * NEW: ~80 lines with CheckboxGroup and age logic
 */

import React from 'react';
import { FileText } from 'lucide-react';
import { FormStep, CheckboxGroup } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
  handleConcernToggle?: (concern: string) => void;
}

/**
 * Step 19: Main Concerns Selection
 * Pattern: Multi-select checkbox group with max 3 selections
 * Age-gated: "Fine lines & wrinkles" only available for age 25+
 */
export const MainConcernsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
  handleConcernToggle,
}) => {
  const calculatedAge = formData.calculatedAge;

  // Available concerns based on age
  const allConcerns = [
    'Acne',
    'Post Acne Scarring',
    'Pigmentation',
    ...(calculatedAge !== null && calculatedAge > 25 ? ['Fine lines & wrinkles'] : []),
    'Large pores',
    'Bumpy skin',
  ];

  const handleChange = (selected: string[]) => {
    if (handleConcernToggle) {
      // If handleConcernToggle is provided, use it (for complex state management)
      // This handles concern priority and follow-up question cleanup
      const currentConcerns = formData.mainConcerns || [];
      const added = selected.find((c) => !currentConcerns.includes(c));
      const removed = currentConcerns.find((c) => !selected.includes(c));

      if (added) {
        handleConcernToggle(added);
      } else if (removed) {
        handleConcernToggle(removed);
      }
    } else {
      // Simple case: just update the array
      updateFormData({ mainConcerns: selected });
    }
  };

  return (
    <FormStep
      title="Main Concerns (pick 1–3)"
      subtitle={`Selected: ${formData.mainConcerns.length}/3`}
      icon={FileText}
      iconVariant="danger"
      centered
    >
      <div className="space-y-4">
        <CheckboxGroup
          options={allConcerns.map((concern) => ({
            value: concern,
            label: concern,
          }))}
          value={formData.mainConcerns}
          onChange={handleChange}
          layout="grid"
          gridCols={2}
          maxSelections={3}
          gap="md"
          error={errors.mainConcerns}
        />

        {/* Age gate message */}
        {calculatedAge !== null && calculatedAge <= 25 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Fine lines & wrinkles becomes available after age 25.
          </p>
        )}
      </div>
    </FormStep>
  );
};

/**
 * Code reduction summary:
 *
 * Old implementation (lines 3568-3618): ~50 lines
 * - Hard-coded checkbox styling with complex ternary logic
 * - Custom isDisabled logic inline
 * - Manual className concatenation
 * - Hard-coded colors (red-400, red-50, etc.)
 *
 * New implementation: ~80 lines (includes comments and age logic)
 * - Uses CheckboxGroup with built-in max selection handling
 * - Age-based concern filtering extracted to clean logic
 * - Consistent styling via variants
 * - Handles both simple and complex state updates
 *
 * Benefits:
 * - CheckboxGroup shows max reached warning automatically
 * - Cleaner age-gate logic
 * - Reusable component for other multi-select scenarios
 * - All styling centralized in variants.ts
 * - Type-safe concern selection
 */
