/**
 * PigmentationConcernSteps - Pigmentation type and severity selection
 * Replaces UpdatedConsultForm.tsx pigmentation logic (lines 2193-2211 + generic rendering)
 *
 * Pattern: Type selection (Red/Brown), then severity based on type
 */

import React from 'react';
import { Sun } from 'lucide-react';
import { FormStep, RadioGroup } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

/**
 * Pigmentation Type Selection Step
 * Pattern: Choose Red or Brown pigmentation
 */
export const PigmentationTypeStep = React.memo<StepProps>(({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <FormStep
      title="What kind of pigmentation is your main concern?"
      subtitle="Pick the option that best matches (Red vs Brown)"
      icon={Sun}
      iconVariant="primary"
      centered
      badge={{ label: 'Pigmentation', variant: 'primary' }}
    >
      <RadioGroup
        options={[
          { value: 'Red', label: 'Red' },
          { value: 'Brown', label: 'Brown' },
        ]}
        value={formData.pigmentationType}
        onChange={(value) => updateFormData({ pigmentationType: value })}
        layout="grid"
        gridCols={2}
        gap="md"
        error={errors.pigmentationType}
      />
    </FormStep>
  );
});

/**
 * Pigmentation Severity Selection Step
 * Pattern: Different severity options based on Red vs Brown type
 */
export const PigmentationSeverityStep = React.memo<StepProps>(({
  formData,
  updateFormData,
  errors,
}) => {
  const currentType = formData.pigmentationType || '';
  const isRed = /\bred\b|redness/i.test(currentType);

  const redOptions = [
    {
      value: 'Light red, only in a small area → Blue',
      label: 'Light red, only in a small area → Blue',
    },
    {
      value: 'Moderate red, noticeable in several zones → Yellow',
      label: 'Moderate red, noticeable in several zones → Yellow',
    },
    {
      value: 'Bright or deep red, widespread across the face → Red',
      label: 'Bright or deep red, widespread across the face → Red',
    },
  ];

  const brownOptions = [
    {
      value: 'Light brown patches, visible up close but small in size → Blue',
      label: 'Light brown patches, visible up close but small in size → Blue',
    },
    {
      value: 'Moderate brown spots/patches, noticeable in several areas → Yellow',
      label: 'Moderate brown spots/patches, noticeable in several areas → Yellow',
    },
    {
      value: 'Dark brown patches, large or widespread across the face → Red',
      label: 'Dark brown patches, large or widespread across the face → Red',
    },
  ];

  const options = isRed ? redOptions : brownOptions;

  return (
    <FormStep
      title="How noticeable is the pigmentation?"
      subtitle="Choose the description closest to what you see"
      icon={Sun}
      iconVariant="primary"
      centered
      badge={{ label: 'Pigmentation', variant: 'primary' }}
    >
      <RadioGroup
        options={options}
        value={formData.pigmentationSeverity}
        onChange={(value) => updateFormData({ pigmentationSeverity: value })}
        layout="single"
        gap="md"
        error={errors.pigmentationSeverity}
      />
    </FormStep>
  );
});

/**
 * Code summary:
 *
 * Old implementation:
 * - Type/severity logic mixed in getConcernOptions (lines 2193-2211)
 * - Generic rendering with hard-coded styling (lines 2534-2574)
 * - Conditional option logic based on formData.pigmentationType
 *
 * New implementation: ~100 lines
 * - Clear separation of Type and Severity steps
 * - Declarative option arrays
 * - Reusable RadioGroup component
 * - Type-safe props
 *
 * Benefits:
 * - Easy to modify severity options
 * - Clear Red vs Brown logic
 * - Consistent with other concern steps
 * - All styling centralized
 */
