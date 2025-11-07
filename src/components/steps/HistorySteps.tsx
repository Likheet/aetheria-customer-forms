/**
 * HistorySteps - Medical history and professional treatment questions
 * Replaces UpdatedConsultForm.tsx steps 14-16 (lines 3373-3449)
 *
 * OLD: ~76 lines with hard-coded styling
 * NEW: ~70 lines with reusable components
 */

import React from 'react';
import { FileText, Heart, Sparkles } from 'lucide-react';
import { FormStep, TextArea } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

/**
 * Step 14: Diagnosed Skin Conditions
 * Pattern: Optional textarea for medical history
 */
export const DiagnosedConditionsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <FormStep
      title="Do you have any diagnosed skin conditions?"
      subtitle="(eczema, psoriasis, rosacea, acne grade, PCOS-related acne, etc.)"
      icon={FileText}
      iconVariant="info"
      centered
    >
      <TextArea
        id="diagnosedConditions"
        value={formData.diagnosedConditions}
        onChange={(e) => updateFormData({ diagnosedConditions: e.target.value })}
        placeholder="Please describe any diagnosed skin conditions or type 'None' if not applicable..."
        rows={4}
        error={errors.diagnosedConditions}
      />
    </FormStep>
  );
};

/**
 * Step 15: Prescription Treatments
 * Pattern: Optional textarea for prescription history
 */
export const PrescriptionTreatmentsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <FormStep
      title="Have you used prescription treatments?"
      subtitle="(Steroids, retinoids, antibiotics, hydroquinone, etc.)"
      icon={Heart}
      iconVariant="info"
      centered
    >
      <TextArea
        id="prescriptionTreatments"
        value={formData.prescriptionTreatments}
        onChange={(e) => updateFormData({ prescriptionTreatments: e.target.value })}
        placeholder="Please describe any prescription treatments you've used or type 'None' if not applicable..."
        rows={4}
        error={errors.prescriptionTreatments}
      />
    </FormStep>
  );
};

/**
 * Step 16: Professional Treatments
 * Pattern: Optional textarea for recent professional treatments
 */
export const ProfessionalTreatmentsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  return (
    <FormStep
      title="Have you had professional treatments in the last 6 months?"
      subtitle="(Chemical peel, laser, microneedling, facials, etc.)"
      icon={Sparkles}
      iconVariant="info"
      centered
    >
      <TextArea
        id="professionalTreatments"
        value={formData.professionalTreatments}
        onChange={(e) => updateFormData({ professionalTreatments: e.target.value })}
        placeholder="Please describe any professional treatments or type 'None' if not applicable..."
        rows={4}
        error={errors.professionalTreatments}
      />
    </FormStep>
  );
};

/**
 * Code reduction summary:
 *
 * Old implementation (lines 3373-3449): ~76 lines
 * - Step 14: ~24 lines
 * - Step 15: ~24 lines
 * - Step 16: ~24 lines
 * - Hard-coded classNames: 9
 * - Repeated FormStep structure: 3 times
 *
 * New implementation: ~70 lines
 * - Step 14: ~20 lines
 * - Step 15: ~20 lines
 * - Step 16: ~20 lines
 * - Hard-coded classNames: 0
 * - Reusable FormStep + TextArea: DRY principle
 *
 * Benefits:
 * - All styling centralized in variants.ts
 * - Consistent validation and error display
 * - Type-safe props
 * - Easy to modify placeholder/label text
 */
