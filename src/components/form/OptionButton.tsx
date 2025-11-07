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
  // Dark theme badge colors with good contrast
  const badgeColors = {
    default: 'bg-gray-800/60 text-gray-200 border-gray-600/50',
    primary: 'bg-amber-800/40 text-amber-200 border-amber-600/50',
    info: 'bg-blue-800/40 text-blue-200 border-blue-600/50',
    success: 'bg-green-800/40 text-green-200 border-green-600/50',
    warning: 'bg-yellow-800/40 text-yellow-200 border-yellow-600/50',
    danger: 'bg-red-800/40 text-red-200 border-red-600/50',
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
          {/* Label - inherits color from variant (light text) */}
          <p className="font-semibold text-base leading-snug">{label}</p>

          {/* Description - slightly dimmed version of label color */}
          {description && (
            <p className="text-sm mt-1 opacity-70">{description}</p>
          )}

          {/* Badge - dark theme with light text */}
          {badge && (
            <span
              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm ${badgeColors[badgeVariant]}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Checkmark - inherits color from variant */}
        {selected && showCheckmark && (
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </button>
  );
};

export default OptionButton;
