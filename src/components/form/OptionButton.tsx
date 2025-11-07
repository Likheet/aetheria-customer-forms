/**
 * OptionButton - Reusable button for single/multi-select options
 * Built on ShadCN Button with modern styling
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
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
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={selected ? "default" : "outline"}
      className={cn(
        optionButtonVariants({ selected, intent }),
        "h-auto min-h-[56px] p-4 justify-start text-left relative overflow-hidden",
        selected && "ring-2 ring-offset-2 ring-offset-gray-900",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex-1">
          {/* Label */}
          <p className="font-semibold text-base leading-snug">{label}</p>

          {/* Description */}
          {description && (
            <p className="text-sm mt-1.5 opacity-75 font-normal">{description}</p>
          )}

          {/* Badge */}
          {badge && (
            <Badge
              variant={badgeVariant === 'default' ? 'secondary' : 'outline'}
              className={cn(
                "mt-2",
                badgeVariant === 'primary' && "bg-amber-500/10 text-amber-300 border-amber-500/30",
                badgeVariant === 'success' && "bg-green-500/10 text-green-300 border-green-500/30",
                badgeVariant === 'warning' && "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
                badgeVariant === 'danger' && "bg-red-500/10 text-red-300 border-red-500/30",
                badgeVariant === 'info' && "bg-blue-500/10 text-blue-300 border-blue-500/30"
              )}
            >
              {badge}
            </Badge>
          )}
        </div>

        {/* Checkmark */}
        {selected && showCheckmark && (
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        )}
      </div>
    </Button>
  );
};

export default OptionButton;
