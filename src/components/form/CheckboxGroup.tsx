/**
 * CheckboxGroup - Multi-select option group using OptionButton
 * For scenarios where users can select multiple options
 */

import React from 'react';
import { OptionButton, type OptionButtonProps } from './OptionButton';

export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  badgeVariant?: OptionButtonProps['badgeVariant'];
}

export interface CheckboxGroupProps {
  /** Available options to choose from */
  options: CheckboxOption[];

  /** Currently selected values */
  value: string[];

  /** Called when selection changes */
  onChange: (values: string[]) => void;

  /** Layout: single column or grid */
  layout?: 'single' | 'grid';

  /** Number of columns for grid layout (default: 2 on desktop) */
  gridCols?: 1 | 2 | 3 | 4;

  /** Gap between options */
  gap?: 'sm' | 'md' | 'lg';

  /** Whether to show checkmark on selected options */
  showCheckmark?: boolean;

  /** Disable the entire group */
  disabled?: boolean;

  /** Error message to display */
  error?: string;

  /** Optional label for the group */
  label?: string;

  /** Optional description for the group */
  description?: string;

  /** Maximum number of selections allowed */
  maxSelections?: number;

  /** Minimum number of selections required */
  minSelections?: number;
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value,
  onChange,
  layout = 'single',
  gridCols = 2,
  gap = 'md',
  showCheckmark = true,
  disabled = false,
  error,
  label,
  description,
  maxSelections,
  minSelections,
}) => {
  const handleToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);

    if (isSelected) {
      // Deselect
      onChange(value.filter((v) => v !== optionValue));
    } else {
      // Select (if not at max)
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't allow selection beyond max
      }
      onChange([...value, optionValue]);
    }
  };

  const layoutClass =
    layout === 'grid'
      ? `grid grid-cols-1 md:grid-cols-${gridCols}`
      : 'flex flex-col';

  const showMaxReached = maxSelections && value.length >= maxSelections;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900">
            {label}
          </label>
          {maxSelections && (
            <span className="text-xs text-gray-500">
              {value.length} / {maxSelections} selected
            </span>
          )}
        </div>
      )}

      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      {showMaxReached && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            Maximum of {maxSelections} option{maxSelections !== 1 ? 's' : ''}{' '}
            selected. Deselect one to choose another.
          </p>
        </div>
      )}

      <div className={`${layoutClass} ${gapClasses[gap]}`}>
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          const isDisabled =
            disabled || (!isSelected && showMaxReached);

          return (
            <OptionButton
              key={option.value}
              label={option.label}
              description={option.description}
              badge={option.badge}
              badgeVariant={option.badgeVariant}
              selected={isSelected}
              intent="default"
              onClick={() => handleToggle(option.value)}
              showCheckmark={showCheckmark}
              disabled={isDisabled}
            />
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
          <span className="font-medium">⚠</span> {error}
        </p>
      )}

      {minSelections && value.length < minSelections && (
        <p className="text-amber-600 text-sm mt-2">
          Please select at least {minSelections} option
          {minSelections !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default CheckboxGroup;
