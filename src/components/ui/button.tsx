import * as React from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'outline';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary/90 via-primary to-primary/90 text-primary-foreground shadow-[0_18px_45px_-20px_rgba(212,176,104,0.6)] hover:shadow-[0_24px_55px_-22px_rgba(212,176,104,0.75)] hover:brightness-105',
  secondary:
    'bg-secondary text-secondary-foreground border border-border/60 hover:bg-secondary/90 hover:border-border/40',
  subtle:
    'bg-muted/80 text-muted-foreground border border-border/40 hover:bg-muted hover:text-foreground',
  outline:
    'border border-border text-foreground hover:bg-foreground/10',
  ghost:
    'text-foreground/80 hover:bg-foreground/10 hover:text-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  default: 'h-12 px-8 text-sm',
  sm: 'h-9 px-4 text-xs uppercase',
  lg: 'h-14 px-10 text-base',
  icon: 'h-11 w-11',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
