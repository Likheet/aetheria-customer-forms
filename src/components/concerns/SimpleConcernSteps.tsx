/**
 * SimpleConcernSteps - Severity selection for Wrinkles, Pores, and Texture
 * Replaces UpdatedConsultForm.tsx concern severity rendering
 *
 * Pattern: Single severity selection (no type selection needed)
 * These are simpler than Acne/Pigmentation/Scarring which have type+severity flow
 */

import React from 'react';
import { Clock, Droplets, Sparkles } from 'lucide-react';
import { FormStep, RadioGroup } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

// Helper to extract severity value from display text
const mapSeverityToValue = (displayText: string): string => {
  if (displayText.includes('→ Blue')) return 'Blue';
  if (displayText.includes('→ Yellow')) return 'Yellow';
  if (displayText.includes('→ Red')) return 'Red';
  return displayText;
};

/**
 * Fine Lines & Wrinkles Severity Step
 * Pattern: Direct severity selection (Blue/Yellow/Red)
 */
export const WrinklesStep = React.memo<StepProps>(({
  formData,
  updateFormData,
  errors,
}) => {
  const options = [
    {
      value: 'A few fine lines or slight looseness in some spots → Blue',
      label: 'A few fine lines or slight looseness in some spots → Blue',
    },
    {
      value: 'Wrinkles or sagging you can see in several areas → Yellow',
      label: 'Wrinkles or sagging you can see in several areas → Yellow',
    },
    {
      value: "Deep wrinkles or sagging that's easy to notice → Red",
      label: "Deep wrinkles or sagging that's easy to notice → Red",
    },
  ];

  const handleChange = (value: string) => {
    updateFormData({ wrinklesType: value });
  };

  return (
    <FormStep
      title="How noticeable are your lines or sagging?"
      subtitle="Choose the description closest to what you see"
      icon={Clock}
      iconVariant="primary"
      centered
      badge={{ label: 'Fine Lines & Wrinkles', variant: 'primary' }}
    >
      <RadioGroup
        options={options}
        value={formData.wrinklesType}
        onChange={handleChange}
        layout="single"
        gap="md"
        error={errors.wrinklesType}
      />
    </FormStep>
  );
});

/**
 * Large Pores Severity Step
 * Pattern: Direct severity selection (Blue/Yellow/Red)
 */
export const PoresStep = React.memo<StepProps>(({
  formData,
  updateFormData,
  errors,
}) => {
  const options = [
    {
      value: 'Noticeable near the nose or small areas on close inspection → Blue',
      label: 'Noticeable near the nose or small areas on close inspection → Blue',
    },
    {
      value: 'Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow',
      label: 'Clearly visible on multiple zones (nose, cheeks, forehead) → Yellow',
    },
    {
      value: 'Large, obvious pores across much of the face, visible from a distance → Red',
      label: 'Large, obvious pores across much of the face, visible from a distance → Red',
    },
  ];

  const handleChange = (value: string) => {
    updateFormData({ poresType: value });
  };

  return (
    <FormStep
      title="How noticeable are your pores?"
      subtitle="Choose the description closest to what you see"
      icon={Droplets}
      iconVariant="primary"
      centered
      badge={{ label: 'Large Pores', variant: 'primary' }}
    >
      <RadioGroup
        options={options}
        value={formData.poresType}
        onChange={handleChange}
        layout="single"
        gap="md"
        error={errors.poresType}
      />
    </FormStep>
  );
});

/**
 * Bumpy Skin (Texture) Severity Step
 * Pattern: Direct severity selection (Blue/Yellow/Red)
 */
export const TextureStep = React.memo<StepProps>(({
  formData,
  updateFormData,
  errors,
}) => {
  const options = [
    {
      value: 'A few small areas with bumps or rough patches (like nose or chin) → Blue',
      label: 'A few small areas with bumps or rough patches (like nose or chin) → Blue',
    },
    {
      value: 'Noticeable bumps or uneven texture in several areas of the face → Yellow',
      label: 'Noticeable bumps or uneven texture in several areas of the face → Yellow',
    },
    {
      value: 'Rough or bumpy texture across most of the face → Red',
      label: 'Rough or bumpy texture across most of the face → Red',
    },
  ];

  const handleChange = (value: string) => {
    updateFormData({ textureType: value });
  };

  return (
    <FormStep
      title="How noticeable is the uneven texture?"
      subtitle="Choose the description closest to what you see"
      icon={Sparkles}
      iconVariant="primary"
      centered
      badge={{ label: 'Bumpy Skin', variant: 'primary' }}
    >
      <RadioGroup
        options={options}
        value={formData.textureType}
        onChange={handleChange}
        layout="single"
        gap="md"
        error={errors.textureType}
      />
    </FormStep>
  );
});

/**
 * Code summary:
 *
 * Old implementation:
 * - Logic scattered in getConcernOptions (lines 2213-2236)
 * - Inline rendering mixed with other concerns
 * - Hard-coded button styling
 * - Severity values stored directly in display format
 *
 * New implementation: ~170 lines
 * - Three separate step components for clarity
 * - Consistent with other concern patterns
 * - Each step uses RadioGroup for DRY code
 * - Appropriate icons: Clock (aging), Droplets (pores), Sparkles (texture)
 * - Badge labeling for context
 *
 * Benefits:
 * - Easy to modify severity options independently
 * - Consistent styling across all severity steps
 * - Type-safe with proper field names
 * - All styling centralized in variants
 * - Simpler than type+severity flows (Acne, Pigmentation, Scarring)
 */
