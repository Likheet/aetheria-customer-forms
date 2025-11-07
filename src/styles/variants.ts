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
  // Base styles applied to all buttons - premium subtle interactions with refined transitions
  'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm active:scale-[0.98] active:shadow-lg relative overflow-hidden',
  {
    variants: {
      // Visual style
      variant: {
        primary: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white hover:from-amber-400 hover:via-amber-500 hover:to-amber-400 focus:ring-amber-500/50 shadow-lg shadow-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/50 border border-amber-400/30',
        secondary: 'bg-gray-800/70 text-gray-100 border-2 border-gray-600/50 hover:bg-gray-700/90 hover:border-gray-500/70 focus:ring-gray-500/50 shadow-md hover:shadow-lg',
        outline: 'border-2 border-amber-500/60 bg-transparent text-amber-200 hover:bg-amber-500/15 hover:border-amber-400/80 focus:ring-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20',
        ghost: 'text-gray-300 hover:bg-gray-800/50 hover:text-amber-200 focus:ring-gray-500/50',
        danger: 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white hover:from-red-400 hover:via-red-500 hover:to-red-400 focus:ring-red-500/50 shadow-lg shadow-red-500/40 hover:shadow-2xl hover:shadow-red-500/50 border border-red-400/30',
      },

      // Size
      size: {
        sm: 'px-3 py-2 text-sm rounded-lg',
        md: 'px-5 py-3 text-base rounded-xl',
        lg: 'px-7 py-4 text-lg rounded-2xl',
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
 * Enhanced luxury theme with refined glows and borders
 */
export const optionButtonVariants = cva(
  'w-full px-6 py-4 text-left rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent backdrop-blur-sm active:scale-[0.99] relative overflow-hidden',
  {
    variants: {
      // Selection state
      selected: {
        true: '',
        false: 'border-gray-700/60 bg-gradient-to-br from-gray-900/50 to-gray-900/40 text-gray-200 hover:border-amber-500/50 hover:bg-gray-800/70 hover:text-gray-100 hover:shadow-md',
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
      // Default selected state - Enhanced Amber/Gold glow
      {
        selected: true,
        intent: 'default',
        class: 'border-amber-400/80 bg-gradient-to-br from-amber-900/40 to-amber-900/30 text-amber-100 shadow-xl shadow-amber-500/40 focus:ring-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/50',
      },
      // Success selected (e.g., "No" to danger questions) - Enhanced Green glow
      {
        selected: true,
        intent: 'success',
        class: 'border-green-400/80 bg-gradient-to-br from-green-900/40 to-green-900/30 text-green-100 shadow-xl shadow-green-500/40 focus:ring-green-500/50 hover:shadow-2xl hover:shadow-green-500/50',
      },
      // Warning selected - Enhanced Yellow glow
      {
        selected: true,
        intent: 'warning',
        class: 'border-yellow-400/80 bg-gradient-to-br from-yellow-900/40 to-yellow-900/30 text-yellow-100 shadow-xl shadow-yellow-500/40 focus:ring-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/50',
      },
      // Danger selected (e.g., "Yes" to safety gates) - Enhanced Red glow
      {
        selected: true,
        intent: 'danger',
        class: 'border-red-400/80 bg-gradient-to-br from-red-900/40 to-red-900/30 text-red-100 shadow-xl shadow-red-500/40 focus:ring-red-500/50 hover:shadow-2xl hover:shadow-red-500/50',
      },
      // Primary selected (concern selection) - Enhanced Blue glow
      {
        selected: true,
        intent: 'primary',
        class: 'border-blue-400/80 bg-gradient-to-br from-blue-900/40 to-blue-900/30 text-blue-100 shadow-xl shadow-blue-500/40 focus:ring-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/50',
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
  'rounded-2xl border transition-all duration-300 backdrop-blur-sm relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-gray-900/70 to-gray-900/60 border-gray-700/50 shadow-lg shadow-gray-900/30 hover:shadow-xl hover:shadow-gray-900/40',
        elevated: 'bg-gradient-to-br from-gray-900/85 to-gray-900/75 border-gray-600/50 shadow-xl shadow-gray-900/40 hover:shadow-2xl hover:shadow-gray-900/50',
        outlined: 'bg-gradient-to-br from-gray-900/50 to-gray-900/40 border-gray-600/60',
        filled: 'bg-gradient-to-br from-gray-800/70 to-gray-800/60 border-gray-700/50',
        primary: 'bg-gradient-to-br from-amber-900/40 to-amber-900/30 border-amber-600/50 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35',
        danger: 'bg-gradient-to-br from-red-900/40 to-red-900/30 border-red-600/50 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35',
        success: 'bg-gradient-to-br from-green-900/40 to-green-900/30 border-green-600/50 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/35',
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
  'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border backdrop-blur-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-gray-800/70 text-gray-100 border-gray-600/60',
        primary: 'bg-gradient-to-br from-amber-800/60 to-amber-800/50 text-amber-200 border-amber-500/60 shadow-md shadow-amber-500/30',
        success: 'bg-gradient-to-br from-green-800/60 to-green-800/50 text-green-200 border-green-500/60 shadow-md shadow-green-500/30',
        warning: 'bg-gradient-to-br from-yellow-800/60 to-yellow-800/50 text-yellow-200 border-yellow-500/60 shadow-md shadow-yellow-500/30',
        danger: 'bg-gradient-to-br from-red-800/60 to-red-800/50 text-red-200 border-red-500/60 shadow-md shadow-red-500/30',
        info: 'bg-gradient-to-br from-blue-800/60 to-blue-800/50 text-blue-200 border-blue-500/60 shadow-md shadow-blue-500/30',
        purple: 'bg-gradient-to-br from-purple-800/60 to-purple-800/50 text-purple-200 border-purple-500/60 shadow-md shadow-purple-500/30',
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
  'inline-flex items-center justify-center rounded-full backdrop-blur-sm border-2 transition-all duration-300 hover:scale-110 hover:rotate-6 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-gray-800/70 to-gray-800/60 text-gray-100 border-gray-600/50 shadow-lg shadow-gray-500/15',
        primary: 'bg-gradient-to-br from-amber-900/50 to-amber-900/40 text-amber-200 border-amber-500/50 shadow-lg shadow-amber-500/40',
        success: 'bg-gradient-to-br from-green-900/50 to-green-900/40 text-green-200 border-green-500/50 shadow-lg shadow-green-500/40',
        danger: 'bg-gradient-to-br from-red-900/50 to-red-900/40 text-red-200 border-red-500/50 shadow-lg shadow-red-500/40',
        warning: 'bg-gradient-to-br from-yellow-900/50 to-yellow-900/40 text-yellow-200 border-yellow-500/50 shadow-lg shadow-yellow-500/40',
        purple: 'bg-gradient-to-br from-purple-900/50 to-purple-900/40 text-purple-200 border-purple-500/50 shadow-lg shadow-purple-500/40',
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
 * Enhanced luxury theme with refined interactions
 */
export const inputVariants = cva(
  'w-full px-5 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent backdrop-blur-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-br from-gray-900/70 to-gray-900/60 border-gray-600/50 text-gray-100 placeholder:text-gray-500 hover:border-amber-500/60 hover:shadow-md hover:shadow-amber-500/10 focus:border-amber-500/80 focus:ring-amber-500/50 focus:bg-gray-900/80 focus:shadow-lg focus:shadow-amber-500/20',
        error: 'bg-gradient-to-br from-red-900/40 to-red-900/30 border-red-500/60 text-red-100 placeholder:text-red-400/50 hover:border-red-400/70 focus:border-red-400 focus:ring-red-500/50 focus:shadow-lg focus:shadow-red-500/20',
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
