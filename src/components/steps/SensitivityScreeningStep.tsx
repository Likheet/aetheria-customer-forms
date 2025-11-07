/**
 * SensitivityScreeningStep - 6 sensitivity questions + auto age detection
 * Replaces UpdatedConsultForm.tsx step 13 (lines 3323-3371)
 *
 * OLD: ~50 lines with hard-coded styling
 * NEW: ~70 lines with reusable components and better structure
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { FormStep, RadioGroup } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

// Sensitivity question configuration
// Note: sensitivitySeasonal is auto-filled based on age, not asked directly
const SENSITIVITY_QUESTIONS = [
  {
    key: 'sensitivityRedness' as keyof UpdatedConsultData,
    label: 'Do you often experience redness, burning, or stinging when using skincare products?',
  },
  {
    key: 'sensitivityDiagnosis' as keyof UpdatedConsultData,
    label: 'Have you ever been diagnosed with sensitive skin, rosacea, or eczema?',
  },
  {
    key: 'sensitivityCleansing' as keyof UpdatedConsultData,
    label: 'Would you describe your skin baseline as very dry (tight, flaky, rough)?',
  },
  {
    key: 'sensitivityProducts' as keyof UpdatedConsultData,
    label: 'Have you noticed breakouts or irritation with actives (Vitamin C, AHAs, Niacinamide, Retinoids, etc.)?',
  },
  {
    key: 'sensitivitySun' as keyof UpdatedConsultData,
    label: 'Does your skin get easily irritated by sun, heat, wind, or pollution?',
  },
  {
    key: 'sensitivityCapillaries' as keyof UpdatedConsultData,
    label: 'Do you have visible broken capillaries or flushing (cheeks, nose, etc.)?',
  },
];

/**
 * Step 13: Sensitivity Screening
 * Pattern: Multiple Yes/No questions in a single step
 * Shows calculated age at the top
 */
export const SensitivityScreeningStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const calculatedAge = formData.calculatedAge;

  return (
    <FormStep
      title="Sensitivity screening"
      subtitle="Please answer the following about your skin."
      icon={Heart}
      iconVariant="primary"
      centered
    >
      <div className="space-y-4">
        {/* Age indicator */}
        {calculatedAge != null && (
          <div className="bg-gray-800/60 backdrop-blur-sm border border-amber-600/40 rounded-2xl p-4 text-sm text-gray-300">
            Detected age from birth date:{' '}
            <span className="font-medium text-amber-200">{calculatedAge}</span>
          </div>
        )}

        {/* Sensitivity questions */}
        {SENSITIVITY_QUESTIONS.map((q) => {
          const value = (formData[q.key] as string) || '';
          const error = errors[q.key as string];

          return (
            <div
              key={q.key}
              className="bg-gray-800/60 backdrop-blur-sm border border-amber-600/40 rounded-2xl p-4"
            >
              <div className="flex flex-col gap-3">
                <label className="text-gray-200 font-medium text-left">{q.label}</label>

                <RadioGroup
                  options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' },
                  ]}
                  value={value}
                  onChange={(val) => updateFormData({ [q.key]: val } as any)}
                  layout="grid"
                  gridCols={2}
                  gap="sm"
                  error={error}
                />
              </div>
            </div>
          );
        })}
      </div>
    </FormStep>
  );
};

/**
 * Code reduction summary:
 *
 * Old implementation (lines 3323-3371): ~50 lines
 * - Hard-coded button styling for each question
 * - Repetitive className logic
 * - Manual Yes/No button rendering
 *
 * New implementation: ~70 lines (includes comments)
 * - Reusable RadioGroup component
 * - Cleaner structure with map
 * - All styling centralized in variants.ts
 *
 * While slightly longer due to config extraction, this is much more maintainable:
 * - Easy to add/remove questions
 * - Consistent styling across all questions
 * - Type-safe with proper typing
 */
