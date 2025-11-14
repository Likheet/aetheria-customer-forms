/**
 * Component Variants - Consistent styling patterns across the app
 * Using class-variance-authority for type-safe variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button variants - replaces all the hard-coded button styles
 * Enhanced luxury dark theme with sophisticated interactions
 */
export const buttonVariants = cva(
  // Base styles - minimal luxury with subtle interactions
  'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      // Visual style - clean and minimal
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/30 shadow-sm hover:shadow-md',
        secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 focus:ring-secondary/30 shadow-sm',
        outline: 'border border-primary/40 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary/60 focus:ring-primary/30',
        ghost: 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground focus:ring-secondary/30',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/30 shadow-sm hover:shadow-md',
      },

      // Size - clean proportions
      size: {
        sm: 'px-4 py-2.5 text-sm rounded-xl',
        md: 'px-6 py-3.5 text-base rounded-xl',
        lg: 'px-8 py-4 text-base rounded-xl',
      },

      // Full width
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

/**
 * Option button variants - for single/multi-select options in forms
 * Clean light theme with smooth, delightful interactions
 */
export const optionButtonVariants = cva(
  'w-full px-7 py-5 text-left rounded-2xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 active:scale-[0.98] relative overflow-hidden text-base font-medium shadow-sm hover:shadow-md',
  {
    variants: {
      // Selection state
      selected: {
        true: '',
        false: 'border-border bg-white text-foreground hover:border-primary/40 hover:bg-secondary/50',
      },

      // Semantic meaning (when selected)
      intent: {
        default: '',
        success: '',
        warning: '',
        danger: '',
        primary: '',
      },
    },
    compoundVariants: [
      // Default selected - teal accent
      {
        selected: true,
        intent: 'default',
        class: 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-md',
      },
      // Success selected
      {
        selected: true,
        intent: 'success',
        class: 'border-green-600 bg-green-50 text-green-700 ring-2 ring-green-200 shadow-md',
      },
      // Warning selected
      {
        selected: true,
        intent: 'warning',
        class: 'border-amber-600 bg-amber-50 text-amber-700 ring-2 ring-amber-200 shadow-md',
      },
      // Danger selected
      {
        selected: true,
        intent: 'danger',
        class: 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-200 shadow-md',
      },
      // Primary selected
      {
        selected: true,
        intent: 'primary',
        class: 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-200 shadow-md',
      },
    ],
    defaultVariants: {
      selected: false,
      intent: 'default',
    },
  }
);

/**
 * Form step container variants
 */
export const formStepVariants = cva(
  'space-y-12 flex flex-col justify-center h-full py-8',
  {
    variants: {
      centered: {
        true: 'items-center text-center',
        false: '',
      },
    },
    defaultVariants: {
      centered: false,
    },
  }
);

/**
 * Card variants
 * Enhanced luxury theme with refined glass-morphism and gradients
 */
export const cardVariants = cva(
  'rounded-2xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-surface/90 border-border shadow-sm',
        elevated: 'bg-surface/95 border-border shadow-md',
        outlined: 'bg-surface/80 border-border',
        filled: 'bg-surface border-border',
        primary: 'bg-primary/10 border-primary/30 shadow-sm',
        danger: 'bg-destructive/10 border-destructive/30 shadow-sm',
        success: 'bg-green-500/10 border-green-500/30 shadow-sm',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

/**
 * Badge variants - for concern tags, severity indicators, etc.
 * Enhanced luxury theme with refined glows
 */
export const badgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-secondary/80 text-foreground border-border',
        primary: 'bg-primary/15 text-primary border-primary/30',
        success: 'bg-green-500/15 text-green-400 border-green-500/30',
        warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        danger: 'bg-red-500/15 text-red-400 border-red-500/30',
        info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Icon container variants - for those circular icon backgrounds
 * Enhanced luxury theme with refined glow effects
 */
export const iconContainerVariants = cva(
  'inline-flex items-center justify-center rounded-full border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-secondary/80 text-foreground border-border',
        primary: 'bg-primary/15 text-primary border-primary/30',
        success: 'bg-green-500/15 text-green-400 border-green-500/30',
        danger: 'bg-red-500/15 text-red-400 border-red-500/30',
        warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      },
      size: {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-20 h-20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

/**
 * Input variants - for text inputs, selects, etc.
 * Clean light theme with smooth interactions
 */
export const inputVariants = cva(
  'w-full px-6 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 font-medium text-lg',
  {
    variants: {
      variant: {
        default: 'bg-white border-border text-foreground placeholder:text-muted-foreground hover:border-primary/50 focus:border-primary focus:ring-primary/20 shadow-sm focus:shadow-md',
        error: 'bg-red-50/50 border-destructive text-foreground placeholder:text-destructive/60 focus:border-destructive focus:ring-destructive/20 shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Export types for use in components
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type OptionButtonVariants = VariantProps<typeof optionButtonVariants>;
export type FormStepVariants = VariantProps<typeof formStepVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type IconContainerVariants = VariantProps<typeof iconContainerVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
