/**
 * EmptyState - Reusable empty state component
 * Eliminates hardcoded empty state patterns throughout the app
 */

import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from './button';

const emptyContainerVariants = cva(
  'flex flex-col items-center justify-center gap-4 text-muted-foreground/80',
  {
    variants: {
      size: {
        sm: 'min-h-[200px]',
        md: 'min-h-[320px]',
        lg: 'min-h-[400px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const iconContainerVariants = cva(
  'flex items-center justify-center rounded-full',
  {
    variants: {
      size: {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
      },
      variant: {
        default: 'bg-surface/70',
        primary: 'bg-primary/10',
        muted: 'bg-muted/50',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface EmptyStateProps extends VariantProps<typeof emptyContainerVariants> {
  /** Icon to display */
  icon: LucideIcon;
  /** Icon size */
  iconSize?: VariantProps<typeof iconContainerVariants>['size'];
  /** Icon container variant */
  iconVariant?: VariantProps<typeof iconContainerVariants>['variant'];
  /** Main title */
  title: string;
  /** Description/subtitle */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  /** Custom className */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  iconSize = 'md',
  iconVariant = 'default',
  title,
  description,
  action,
  size,
  className,
}) => {
  return (
    <div className={emptyContainerVariants({ size, className })}>
      <div className={iconContainerVariants({ size: iconSize, variant: iconVariant })}>
        <Icon className={iconSize === 'sm' ? 'h-5 w-5' : iconSize === 'lg' ? 'h-9 w-9' : 'h-7 w-7'} />
      </div>
      <div className="text-center">
        <p className="font-serif text-lg text-foreground/85">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground/70">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
