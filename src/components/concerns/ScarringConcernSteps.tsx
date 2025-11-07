/**
 * ScarringConcernSteps - Post Acne Scarring type and severity/color selection
 * Replaces UpdatedConsultForm.tsx scarring logic (lines 2237-2262 + lines 2427-2523)
 *
 * Pattern: Type selection, then either color (for PIH) or severity (for physical scars)
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { FormStep, RadioGroup } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

// Helper to map display text to subtype
const mapScarringTypeToSubtype = (displayText: string): string => {
  if (displayText.includes('pitted scars') || displayText.includes('Ice pick')) {
    return 'IcePick';
  }
  if (displayText.includes('shallow depressions') || displayText.includes('Rolling')) {
    return 'Rolling';
  }
  if (displayText.includes('dark marks') || displayText.includes('post-inflammatory pigmentation')) {
    return 'PIH';
  }
  if (displayText.includes('Raised') || displayText.includes('Keloid')) {
    return 'Keloid';
  }
  return '';
};

// Helper to extract severity/color value from display text
const mapScarringSeverityToValue = (displayText: string): string => {
  // Severity format
  if (displayText.includes('→ Blue')) return 'Blue';
  if (displayText.includes('→ Yellow')) return 'Yellow';
  if (displayText.includes('→ Red') && !displayText.includes('Active')) return 'Red';
  // Color selection format
  if (displayText.includes('Red') && displayText.includes('Active')) return 'Red';
  if (displayText.includes('Brown') && displayText.includes('Pigmented')) return 'Brown';
  if (displayText.includes('Both') && displayText.includes('Combination')) return 'Both';
  return '';
};

/**
 * Post Acne Scarring Type Selection Step
 * Pattern: Select scar type (Ice pick, Rolling, PIH, Keloid)
 */
export const ScarringTypeStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const typeOptions = [
    {
      value: 'Small, shallow, round or pitted scars → Ice pick / pitted scars',
      label: 'Small, shallow, round or pitted scars → Ice pick / pitted scars',
    },
    {
      value: 'Broad, shallow depressions → Rolling scars',
      label: 'Broad, shallow depressions → Rolling scars',
    },
    {
      value: 'Flat or slightly raised dark marks → post-inflammatory pigmentation',
      label: 'Flat or slightly raised dark marks → post-inflammatory pigmentation',
    },
    {
      value: 'Raised, thick scars → Keloid / hypertrophic scars',
      label: 'Raised, thick scars → Keloid / hypertrophic scars',
    },
  ];

  const handleChange = (value: string) => {
    const subtype = mapScarringTypeToSubtype(value);
    updateFormData({
      postAcneScarringType: value,
      postAcneScarringSubtype: subtype as any,
      postAcneScarringSeverity: '',
      postAcneScarringColor: '',
    });
  };

  return (
    <FormStep
      title="What type of marks do you notice on your skin after acne heals?"
      subtitle="Select the option that matches your scars"
      icon={Sparkles}
      iconVariant="purple"
      centered
      badge={{ label: 'Post Acne Scarring', variant: 'purple' }}
    >
      <RadioGroup
        options={typeOptions}
        value={formData.postAcneScarringType}
        onChange={handleChange}
        layout="single"
        gap="md"
        error={errors.postAcneScarringType}
      />
    </FormStep>
  );
};

/**
 * Post Acne Scarring Severity/Color Selection Step
 * Pattern: If PIH, select color; otherwise select severity
 */
export const ScarringSeverityStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const scarType = formData.postAcneScarringType || '';
  const isPigmentation = scarType.includes('pigmentation') || scarType.includes('Post-inflammatory');

  // Color options for PIH
  const colorOptions = [
    {
      value: 'Red → Active / recent marks',
      label: 'Red → Active / recent marks',
    },
    {
      value: 'Brown → Pigmented / older marks',
      label: 'Brown → Pigmented / older marks',
    },
    {
      value: 'Both → Combination',
      label: 'Both → Combination',
    },
  ];

  // Severity options for physical scars
  const severityOptions = [
    {
      value: 'Less than 10% of face affected, slight visibility, slight uneven texture → Blue',
      label: 'Less than 10% of face affected, slight visibility, slight uneven texture → Blue',
    },
    {
      value: '10–30% of face affected, noticeable at normal distance, moderate bumps/indentations → Yellow',
      label: '10–30% of face affected, noticeable at normal distance, moderate bumps/indentations → Yellow',
    },
    {
      value: 'More than 30% of face affected, very prominent, deep pits or thick raised scars → Red',
      label: 'More than 30% of face affected, very prominent, deep pits or thick raised scars → Red',
    },
  ];

  const options = isPigmentation ? colorOptions : severityOptions;
  const currentValue = isPigmentation ? formData.postAcneScarringColor : formData.postAcneScarringSeverity;

  const handleChange = (value: string) => {
    const mappedValue = mapScarringSeverityToValue(value);
    if (isPigmentation) {
      updateFormData({ postAcneScarringColor: mappedValue });
    } else {
      updateFormData({ postAcneScarringSeverity: mappedValue });
    }
  };

  const title = isPigmentation
    ? 'What colour are your post acne marks?'
    : 'How would you describe the severity?';

  const subtitle = isPigmentation
    ? 'Select the color that best describes your marks'
    : 'Choose the severity that best fits your situation';

  return (
    <FormStep
      title={title}
      subtitle={subtitle}
      icon={Sparkles}
      iconVariant="purple"
      centered
      badge={{ label: 'Post Acne Scarring', variant: 'purple' }}
    >
      <div className="space-y-2">
        <p className="text-sm text-purple-600 text-center">
          {isPigmentation ? 'Select color' : 'Select severity'}
        </p>

        <RadioGroup
          options={options}
          value={currentValue}
          onChange={handleChange}
          layout="single"
          gap="md"
          error={isPigmentation ? errors.postAcneScarringColor : errors.postAcneScarringSeverity}
        />
      </div>
    </FormStep>
  );
};

/**
 * Code summary:
 *
 * Old implementation:
 * - Type/severity logic in getConcernOptions (lines 2237-2262)
 * - Large inline rendering (lines 2427-2523, ~96 lines)
 * - Hard-coded button styling
 * - Complex conditional logic for PIH vs physical scars
 *
 * New implementation: ~180 lines
 * - Clear separation of Type and Severity steps
 * - Helper functions for mapping values
 * - Declarative option arrays
 * - Conditional rendering based on scar type
 * - Reusable RadioGroup component
 *
 * Benefits:
 * - Easy to modify options for each scar type
 * - Clear PIH vs physical scar logic
 * - Type-safe with proper subtypes
 * - All styling centralized
 * - Easier to test independently
 */
