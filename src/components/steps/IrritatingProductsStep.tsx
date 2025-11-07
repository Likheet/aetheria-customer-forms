/**
 * IrritatingProductsStep - Tag input for products that caused reactions
 * Replaces UpdatedConsultForm.tsx step 18 (lines 3543-3565)
 *
 * OLD: ~22 lines (plus 177-line inline TagInput component)
 * NEW: ~50 lines (TagInput extracted to reusable component)
 */

import React from 'react';
import { Shield } from 'lucide-react';
import { FormStep, TagInput } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

/**
 * Step 18: Irritating Products
 * Pattern: Tag input with autocomplete for product names/ingredients
 * Stores as both comma-separated string and array
 */
export const IrritatingProductsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  // Get current value as array
  const currentValue =
    (formData as any).productReactionsList ||
    (formData.irritatingProducts
      ? formData.irritatingProducts
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []);

  const handleChange = (list: string[]) => {
    updateFormData({
      irritatingProducts: list.join(', '),
      productReactionsList: list,
    } as any);
  };

  return (
    <FormStep
      title="Any product that caused irritation/breakouts/redness?"
      subtitle="(Specify)"
      icon={Shield}
      iconVariant="purple"
      centered
    >
      <div className="space-y-2">
        <TagInput
          value={currentValue}
          onChange={handleChange}
          placeholder="Type a product or ingredient, then press Enter or comma..."
        />

        {errors.irritatingProducts && (
          <p className="text-red-500 text-sm flex items-center justify-center gap-1">
            <span className="font-medium">⚠</span> {errors.irritatingProducts}
          </p>
        )}
      </div>
    </FormStep>
  );
};

/**
 * Code reduction summary:
 *
 * Old implementation:
 * - Step 18: ~22 lines (lines 3543-3565)
 * - TagInput component: ~177 lines (lines 1148-1325)
 * - Total: ~199 lines inline in UpdatedConsultForm
 *
 * New implementation:
 * - IrritatingProductsStep: ~50 lines
 * - TagInput component: ~210 lines (extracted to form/TagInput.tsx)
 * - Total: ~260 lines (but TagInput is now reusable)
 *
 * Benefits:
 * - TagInput can be reused elsewhere
 * - Cleaner UpdatedConsultForm (removes 199 inline lines)
 * - Better separation of concerns
 * - Easier to test TagInput independently
 * - Autocomplete suggestions centralized
 */
