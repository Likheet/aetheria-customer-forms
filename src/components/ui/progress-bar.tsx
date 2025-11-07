/**
 * ProgressBar - Reusable progress indicator component
 * Eliminates hardcoded progress bar patterns
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const progressContainerVariants = cva(
  'w-full overflow-hidden rounded-full transition-all duration-300',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
      variant: {
        default: 'bg-border/40',
        muted: 'bg-muted/30',
        elevated: 'bg-surface/70',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const progressBarVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      color: {
        primary: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/50',
        secondary: 'bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700',
        success: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 shadow-lg shadow-green-500/50',
        warning: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/50',
        danger: 'bg-gradient-to-r from-red-400 via-red-500 to-red-600 shadow-lg shadow-red-500/50',
        info: 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 shadow-lg shadow-blue-500/50',
        purple: 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 shadow-lg shadow-purple-500/50',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  }
);

export interface ProgressBarProps extends VariantProps<typeof progressContainerVariants> {
  /** Progress value (0-100) */
  value: number;
  /** Progress bar color */
  color?: VariantProps<typeof progressBarVariants>['color'];
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: 'top' | 'bottom' | 'inline';
  /** Custom label text */
  customLabel?: string;
  /** Custom className for container */
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size,
  variant,
  color = 'primary',
  showLabel = false,
  labelPosition = 'top',
  customLabel,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const labelText = customLabel || `${Math.round(clampedValue)}%`;

  return (
    <div className={className}>
      {showLabel && labelPosition === 'top' && (
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground/70">
          <span>{labelText}</span>
        </div>
      )}

      <div className={progressContainerVariants({ size, variant })}>
        <div
          className={progressBarVariants({ color })}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {showLabel && labelPosition === 'bottom' && (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground/70">
          <span>{labelText}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
