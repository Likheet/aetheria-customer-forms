/**
 * OptionButton - Reusable button for single/multi-select options
 * Replaces all the hard-coded option button patterns
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { optionButtonVariants, type OptionButtonVariants } from '../../styles/variants';

export interface OptionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Display label for the option */
  label: string;

  /** Whether this option is currently selected */
  selected?: boolean;

  /** Semantic meaning of the selection (affects color when selected) */
  intent?: OptionButtonVariants['intent'];

  /** Optional description/subtitle below the label */
  description?: string;

  /** Optional badge text (e.g., category label) */
  badge?: string;

  /** Badge variant color */
  badgeVariant?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

  /** Show checkmark icon when selected */
  showCheckmark?: boolean;

  /** Click handler */
  onClick: () => void;

  /** Custom className to merge with variants */
  className?: string;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected = false,
  intent = 'default',
  description,
  badge,
  badgeVariant = 'default',
  showCheckmark = true,
  onClick,
  className,
  disabled,
  ...props
}) => {
  const badgeColors = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={optionButtonVariants({ selected, intent, className })}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex-1 text-left">
          <p className="font-semibold text-base leading-snug">{label}</p>

          {description && (
            <p className="text-sm mt-1 opacity-75">{description}</p>
          )}

          {badge && (
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColors[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
        </div>

        {selected && showCheckmark && (
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
};

export default OptionButton;
