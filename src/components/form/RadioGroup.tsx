/**
 * RadioGroup - Single-select option group using OptionButton
 * Simplifies the common pattern of radio-style selections
 */

import React from 'react';
import { OptionButton, type OptionButtonProps } from './OptionButton';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  badgeVariant?: OptionButtonProps['badgeVariant'];
  intent?: OptionButtonProps['intent'];
}

export interface RadioGroupProps {
  /** Available options to choose from */
  options: RadioOption[];

  /** Currently selected value */
  value: string;

  /** Called when selection changes */
  onChange: (value: string) => void;

  /** Layout: single column or grid */
  layout?: 'single' | 'grid';

  /** Number of columns for grid layout (default: 2 on desktop) */
  gridCols?: 1 | 2 | 3 | 4;

  /** Gap between options */
  gap?: 'sm' | 'md' | 'lg';

  /** Whether to show checkmark on selected option */
  showCheckmark?: boolean;

  /** Disable the entire group */
  disabled?: boolean;

  /** Error message to display */
  error?: string;

  /** Optional label for the group */
  label?: string;

  /** Optional description for the group */
  description?: string;
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
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
}) => {
  const layoutClass =
    layout === 'grid'
      ? `grid grid-cols-1 md:grid-cols-${gridCols}`
      : 'flex flex-col';

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Label - Dark text on light background */}
      {label && (
        <label className="block text-sm font-semibold text-foreground mb-3">
          {label}
        </label>
      )}

      {/* Description - Muted but readable */}
      {description && (
        <p className="text-sm text-muted-foreground mb-5">{description}</p>
      )}

      <div className={`${layoutClass} ${gapClasses[gap]}`}>
        {options.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            description={option.description}
            badge={option.badge}
            badgeVariant={option.badgeVariant}
            selected={value === option.value}
            intent={option.intent}
            onClick={() => onChange(option.value)}
            showCheckmark={showCheckmark}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Error - Clear red text */}
      {error && (
        <p className="text-destructive text-sm mt-3 flex items-center gap-1.5 font-medium">
          <span className="text-base">⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;
