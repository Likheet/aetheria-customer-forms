import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'primary' | 'outline' | 'subtle';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary/15 text-primary ring-1 ring-primary/30',
  outline: 'border border-border text-foreground',
  subtle: 'bg-muted/60 text-muted-foreground',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';
