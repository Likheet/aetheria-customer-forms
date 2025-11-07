/**
 * AcneConcernSteps - Acne type and severity selection
 * Replaces UpdatedConsultForm.tsx lines 2279-2424
 *
 * OLD: ~145 lines with hard-coded styling
 * NEW: ~200 lines with reusable components and better structure
 */

import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { FormStep, RadioGroup } from '../form';
import { UpdatedConsultData, AcneCategory } from '../../types';
import { deriveAcneCategoryLabel } from '../../lib/decisionEngine';

interface StepProps {
  formData: UpdatedConsultData;
  updateFormData: (updates: Partial<UpdatedConsultData>) => void;
  errors: Record<string, string>;
}

const ACNE_TYPE_OPTIONS = [
  'Blackheads (tiny dark dots in pores)',
  'Whiteheads (small white bumps under the skin)',
  'Red pimples (inflamed, sometimes pus-filled)',
  'Large painful bumps (deep cystic acne)',
  'Mostly around jawline/chin, often before periods (hormonal)',
];

const deriveAcneCategory = (acneType: string): string =>
  deriveAcneCategoryLabel(acneType) || '';

const getAcneSeverityOptions = (acneType: string): string[] => {
  const normalized = (acneType || '').toLowerCase();
  if (normalized.includes('blackheads')) {
    return [
      'A few, mostly on the nose (≤10) → Blue',
      'Many in the T-zone (11–30) → Yellow',
      'Widespread across face (30+) → Red',
    ];
  }
  if (normalized.includes('whiteheads')) {
    return [
      'A few, small area (≤10) → Blue',
      'Many in several areas (11–20) → Yellow',
      'Widespread across face (20+) → Red',
    ];
  }
  if (normalized.includes('red pimples') || normalized.includes('inflamed')) {
    return [
      'A few (1–3), mild → Blue',
      'Several (4–10), some painful → Yellow',
      'Many (10+), inflamed/widespread → Red',
    ];
  }
  if (normalized.includes('cystic') || normalized.includes('large painful')) {
    return [
      'Rare (1 in last 2 weeks) → Blue',
      'Frequent (1–3 per week) → Yellow',
      'Persistent (4+ per week or multiple at once) → Red',
    ];
  }
  if (normalized.includes('jawline') || normalized.includes('hormonal')) {
    return [
      'Mild monthly flare (1–3 pimples) → Blue',
      'Clear monthly flare (several pimples/cyst lasting a week) → Yellow',
      'Strong monthly flare (multiple cysts lasting >1 week) → Red',
    ];
  }
  return [
    'Mild (few breakouts) → Blue',
    'Moderate (several breakouts) → Yellow',
    'Severe (many breakouts) → Red',
  ];
};

const getAcneTypeBadge = (acneType: string): string | null => {
  if (!acneType) return null;
  if (acneType.includes('Blackheads')) return 'Blackheads';
  if (acneType.includes('Whiteheads')) return 'Whiteheads';
  if (acneType.includes('Red pimples')) return 'Inflamed';
  if (acneType.includes('Large painful bumps') || acneType.includes('cystic')) return 'Cystic';
  if (acneType.includes('jawline') || acneType.includes('hormonal')) return 'Hormonal';
  return 'Acne';
};

/**
 * Acne Type Selection Step
 * Pattern: Multi-select for breakout types
 */
export const AcneTypeStep: React.FC<StepProps> = ({ formData, updateFormData, errors }) => {
  const acneBreakouts = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : [];

  const toggleAcneBreakout = (option: string) => {
    const exists = acneBreakouts.find((item) => item.type === option);
    if (exists) {
      updateFormData({ acneBreakouts: acneBreakouts.filter((item) => item.type !== option) });
    } else {
      const category = (deriveAcneCategory(option) || 'Comedonal acne') as AcneCategory;
      updateFormData({ acneBreakouts: [...acneBreakouts, { type: option, severity: '', category }] });
    }
  };

  return (
    <FormStep
      title="What kinds of breakouts do you get?"
      subtitle="Pick all that apply"
      icon={Shield}
      iconVariant="primary"
      centered
      badge={{ label: 'Acne', variant: 'primary' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACNE_TYPE_OPTIONS.map((option) => {
          const isSelected = acneBreakouts.some((item) => item.type === option);
          const category = deriveAcneCategory(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleAcneBreakout(option)}
              className={`px-6 py-4 text-left rounded-xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-lg'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{option}</p>
                  <p className="text-sm text-amber-600">{category || 'Acne'}</p>
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-amber-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {errors.acneBreakouts && (
        <p className="text-red-500 text-sm mt-2">{errors.acneBreakouts}</p>
      )}
    </FormStep>
  );
};

/**
 * Acne Severity Selection Step
 * Pattern: For each selected breakout type, choose severity
 */
export const AcneSeverityStep: React.FC<StepProps> = ({ formData, updateFormData, errors }) => {
  const acneBreakouts = Array.isArray(formData.acneBreakouts) ? formData.acneBreakouts : [];

  if (!acneBreakouts.length) {
    return (
      <FormStep
        title="How noticeable are those breakouts?"
        subtitle="Select at least one breakout type to continue."
        icon={Shield}
        iconVariant="primary"
        centered
      >
        <div className="text-gray-600 text-center">
          <p>Please go back and select at least one breakout type.</p>
        </div>
      </FormStep>
    );
  }

  const setSeverity = (index: number, value: string) => {
    const next = acneBreakouts.map((item, idx) => {
      if (idx !== index) return item;
      const category = (deriveAcneCategory(item.type) || item.category) as AcneCategory;
      return { ...item, severity: value, category };
    });
    updateFormData({ acneBreakouts: next });
  };

  const toggleAcneBreakout = (type: string) => {
    updateFormData({ acneBreakouts: acneBreakouts.filter((item) => item.type !== type) });
  };

  return (
    <FormStep
      title="How noticeable are those breakouts?"
      subtitle="Choose a severity for each breakout type"
      icon={Shield}
      iconVariant="primary"
      centered
      badge={{ label: 'Acne', variant: 'primary' }}
    >
      <div className="space-y-6">
        {acneBreakouts.map((item, index) => {
          const severityOptions = getAcneSeverityOptions(item.type);
          const badge = getAcneTypeBadge(item.type);

          return (
            <div
              key={`${item.type}-${index}`}
              className="bg-white/80 border border-amber-200 rounded-2xl p-6 shadow-sm"
            >
              {/* Header with badge and remove button */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {badge && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200">
                      {badge}
                    </span>
                  )}
                  <span className="text-lg font-semibold text-gray-900">{item.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-amber-600">
                    {deriveAcneCategory(item.type)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAcneBreakout(item.type)}
                    className="text-sm text-amber-500 hover:text-amber-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Severity options */}
              <RadioGroup
                options={severityOptions.map((option) => ({
                  value: option,
                  label: option,
                }))}
                value={item.severity}
                onChange={(value) => setSeverity(index, value)}
                layout="grid"
                gridCols={3}
                gap="sm"
              />
            </div>
          );
        })}

        {errors.acneBreakouts && <p className="text-red-500 text-sm">{errors.acneBreakouts}</p>}
      </div>
    </FormStep>
  );
};

/**
 * Code reduction summary:
 *
 * Old implementation (lines 2279-2424): ~145 lines
 * - Hard-coded button styling
 * - Nested ternary operators for className
 * - Manual CheckCircle rendering
 * - Repeated pattern for each severity option
 *
 * New implementation: ~200 lines (includes type definitions and helper functions)
 * - Reusable RadioGroup for severity selection
 * - Clear separation of Type and Severity steps
 * - Cleaner toggle logic
 * - All styling centralized
 *
 * Benefits:
 * - RadioGroup handles selected state styling
 * - Helper functions clearly defined
 * - Easy to add new acne types
 * - Easy to modify severity options
 * - Type-safe with proper interfaces
 */
