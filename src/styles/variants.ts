/**
 * Component Variants - Consistent styling patterns across the app
 * Using class-variance-authority for type-safe variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button variants - replaces all the hard-coded button styles
 */
export const buttonVariants = cva(
  // Base styles applied to all buttons
  'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      // Visual style
      variant: {
        primary: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        outline: 'border-2 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      },

      // Size
      size: {
        sm: 'px-3 py-2 text-sm rounded-lg',
        md: 'px-4 py-3 text-base rounded-xl',
        lg: 'px-6 py-4 text-lg rounded-xl',
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
 * This is the most common pattern in your forms
 */
export const optionButtonVariants = cva(
  'w-full px-6 py-4 text-left rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      // Selection state
      selected: {
        true: '',
        false: 'border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300 hover:bg-gray-100',
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
      // Default selected state
      {
        selected: true,
        intent: 'default',
        class: 'border-amber-400 bg-amber-50 text-amber-900 shadow-lg focus:ring-amber-500',
      },
      // Success selected (e.g., "No" to danger questions)
      {
        selected: true,
        intent: 'success',
        class: 'border-green-400 bg-green-50 text-green-900 shadow-lg focus:ring-green-500',
      },
      // Warning selected
      {
        selected: true,
        intent: 'warning',
        class: 'border-yellow-400 bg-yellow-50 text-yellow-900 shadow-lg focus:ring-yellow-500',
      },
      // Danger selected (e.g., "Yes" to safety gates)
      {
        selected: true,
        intent: 'danger',
        class: 'border-red-400 bg-red-50 text-red-900 shadow-lg focus:ring-red-500',
      },
      // Primary selected (concern selection)
      {
        selected: true,
        intent: 'primary',
        class: 'border-blue-400 bg-blue-50 text-blue-900 shadow-lg focus:ring-blue-500',
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
 */
export const cardVariants = cva(
  'rounded-2xl border transition-all',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 shadow-sm',
        elevated: 'bg-white border-gray-200 shadow-lg',
        outlined: 'bg-white border-gray-300',
        filled: 'bg-gray-50 border-gray-200',
        primary: 'bg-amber-50 border-amber-200',
        danger: 'bg-red-50 border-red-200',
        success: 'bg-green-50 border-green-200',
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
 */
export const badgeVariants = cva(
  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 border-gray-200',
        primary: 'bg-amber-100 text-amber-800 border-amber-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
        purple: 'bg-purple-100 text-purple-800 border-purple-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Icon container variants - for those circular icon backgrounds
 */
export const iconContainerVariants = cva(
  'inline-flex items-center justify-center rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-600',
        primary: 'bg-amber-100 text-amber-600',
        success: 'bg-green-100 text-green-600',
        danger: 'bg-red-100 text-red-600',
        warning: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
      },
      size: {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
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
 */
export const inputVariants = cva(
  'w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white focus:border-amber-400 focus:ring-amber-500',
        error: 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-500',
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
