/**
 * PreferencesAndLegalSteps - Routine preferences and legal disclaimer
 * Replaces UpdatedConsultForm.tsx steps for preferences + legal (lines 2646-2815)
 *
 * Pattern: Radio button preferences + checkbox disclaimer
 */

import React from 'react';
import { Sparkles, Droplets, Shield } from 'lucide-react';
import { FormStep, RadioGroup } from '../form';
import { UpdatedConsultData } from '../../types';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

// Legal disclaimer field keys
const LEGAL_DISCLAIMER_KEYS = [
  'legalDisclaimerNotMedical',
  'legalDisclaimerConsultDermatologist',
  'legalDisclaimerPatchTest',
  'legalDisclaimerDiscontinueUse',
  'legalDisclaimerDiscloseInfo',
  'legalDisclaimerNoLiability',
] as const;

type LegalDisclaimerField = (typeof LEGAL_DISCLAIMER_KEYS)[number];

/**
 * Routine Steps Preference
 * Pattern: 3-step, 4-step, or 5+ step routine
 */
export const RoutineStepsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const options = [
    { value: '3-step', label: '3-step' },
    { value: '4-step', label: '4-step' },
    { value: '5+ step', label: '5+ step' },
  ];

  return (
    <FormStep
      title="How many steps do you want in your skincare routine?"
      icon={Sparkles}
      iconVariant="primary"
      centered
    >
      <RadioGroup
        options={options}
        value={formData.routineSteps}
        onChange={(value) => updateFormData({ routineSteps: value })}
        layout="grid"
        gridCols={3}
        gap="md"
        error={errors.routineSteps}
      />
    </FormStep>
  );
};

/**
 * Serum Comfort Preference
 * Pattern: 1, 2, or 3 serums
 */
export const SerumComfortStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const options = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
  ];

  return (
    <FormStep
      title="How many serums are you comfortable using?"
      icon={Droplets}
      iconVariant="primary"
      centered
    >
      <RadioGroup
        options={options}
        value={formData.serumComfort}
        onChange={(value) => updateFormData({ serumComfort: value })}
        layout="grid"
        gridCols={3}
        gap="md"
        error={errors.serumComfort}
      />
    </FormStep>
  );
};

/**
 * Legal Disclaimer Step
 * Pattern: Multiple checkboxes + master "agree to all" checkbox
 */
export const LegalDisclaimerStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  // Check if all individual disclaimers are checked
  const allChecked = LEGAL_DISCLAIMER_KEYS.every(
    (key) => formData[key] === true
  );

  // Handle master checkbox (checks/unchecks all)
  const handleMasterCheckbox = (checked: boolean) => {
    const disclaimerUpdates: Partial<
      Pick<UpdatedConsultData, LegalDisclaimerField | 'legalDisclaimerAgreed'>
    > = {
      legalDisclaimerAgreed: checked,
    };

    LEGAL_DISCLAIMER_KEYS.forEach((key) => {
      disclaimerUpdates[key] = checked;
    });

    updateFormData(disclaimerUpdates as Partial<UpdatedConsultData>);
  };

  // Handle individual checkbox
  const handleIndividualCheckbox = (
    key: LegalDisclaimerField,
    checked: boolean
  ) => {
    const updates: Partial<UpdatedConsultData> = { [key]: checked };

    // If unchecking any individual item, uncheck master
    if (!checked) {
      updates.legalDisclaimerAgreed = false;
    }
    // If this makes all items checked, check master
    else if (
      LEGAL_DISCLAIMER_KEYS.every((k) =>
        k === key ? checked : formData[k] === true
      )
    ) {
      updates.legalDisclaimerAgreed = true;
    }

    updateFormData(updates);
  };

  return (
    <FormStep
      title="Important Legal Disclaimer"
      subtitle="Please read and acknowledge the following before proceeding:"
      icon={Shield}
      iconVariant="danger"
      centered
    >
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Individual disclaimer items */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">
            Before using this system, I understand and agree:
          </h3>
          <ul className="space-y-3 text-sm text-red-700">
            <li className="flex items-start">
              <input
                type="checkbox"
                checked={formData.legalDisclaimerNotMedical || false}
                onChange={(e) =>
                  handleIndividualCheckbox(
                    'legalDisclaimerNotMedical',
                    e.target.checked
                  )
                }
                className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
              />
              <span>
                This tool provides general skincare guidance and is NOT a
                medical diagnosis
              </span>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                checked={formData.legalDisclaimerConsultDermatologist || false}
                onChange={(e) =>
                  handleIndividualCheckbox(
                    'legalDisclaimerConsultDermatologist',
                    e.target.checked
                  )
                }
                className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
              />
              <span>
                I should consult a dermatologist for severe acne, suspicious
                moles, or worsening conditions
              </span>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                checked={formData.legalDisclaimerPatchTest || false}
                onChange={(e) =>
                  handleIndividualCheckbox(
                    'legalDisclaimerPatchTest',
                    e.target.checked
                  )
                }
                className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
              />
              <span>
                I will perform a patch test for all new products before
                full-face application
              </span>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                checked={formData.legalDisclaimerDiscontinueUse || false}
                onChange={(e) =>
                  handleIndividualCheckbox(
                    'legalDisclaimerDiscontinueUse',
                    e.target.checked
                  )
                }
                className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
              />
              <span>
                I will discontinue use immediately if irritation, redness, or
                allergic reaction occurs
              </span>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                checked={formData.legalDisclaimerDiscloseInfo || false}
                onChange={(e) =>
                  handleIndividualCheckbox(
                    'legalDisclaimerDiscloseInfo',
                    e.target.checked
                  )
                }
                className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
              />
              <span>
                I am responsible for disclosing all allergies, medications, and
                health conditions accurately
              </span>
            </li>
            <li className="flex items-start">
              <input
                type="checkbox"
                checked={formData.legalDisclaimerNoLiability || false}
                onChange={(e) =>
                  handleIndividualCheckbox(
                    'legalDisclaimerNoLiability',
                    e.target.checked
                  )
                }
                className="mr-3 mt-0.5 h-4 w-4 text-red-600 border-gray-300 focus:ring-red-400"
              />
              <span>
                The salon and software provider are not liable for adverse
                reactions from product misuse or failure to disclose medical
                information
              </span>
            </li>
          </ul>
        </div>

        {/* Master checkbox */}
        <div className="flex items-center justify-center">
          <label className="flex items-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-red-300 transition-all duration-300">
            <input
              type="checkbox"
              checked={allChecked && formData.legalDisclaimerAgreed}
              onChange={(e) => handleMasterCheckbox(e.target.checked)}
              className="mr-3 h-5 w-5 text-red-600 border-gray-300 focus:ring-red-400"
            />
            <span className="text-lg text-gray-700">
              All disclaimer points acknowledged
            </span>
          </label>
        </div>

        {errors.legalDisclaimerAgreed && (
          <p className="text-red-500 text-sm text-center">
            {errors.legalDisclaimerAgreed}
          </p>
        )}
      </div>
    </FormStep>
  );
};

/**
 * Code summary:
 *
 * Old implementation:
 * - Routine steps (lines 2646-2678): ~32 lines
 * - Serum comfort (lines 2680-2712): ~32 lines
 * - Legal disclaimer (lines 2715-2815): ~100 lines
 * - Total: ~164 lines with hard-coded styling
 *
 * New implementation: ~300 lines (includes comments and better structure)
 * - RoutineStepsStep: ~25 lines
 * - SerumComfortStep: ~25 lines
 * - LegalDisclaimerStep: ~200 lines (complex due to multiple checkboxes)
 * - Uses RadioGroup for consistency
 * - Better state management for master/individual checkboxes
 *
 * Benefits:
 * - All styling centralized in variants
 * - Reusable RadioGroup for preferences
 * - Clear checkbox logic with proper sync
 * - Type-safe disclaimer field handling
 * - Easy to modify disclaimer text
 * - Consistent with other step components
 */
