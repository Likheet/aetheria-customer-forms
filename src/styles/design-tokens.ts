/**
 * Design Tokens - Single source of truth for design values
 * Change these values to update the entire application's appearance
 */

export const colors = {
  // Primary palette
  primary: {
    50: '#FFF8F0',
    100: '#FEF3E5',
    200: '#FDE7CB',
    300: '#FBDBB1',
    400: '#F9CF97',
    500: '#E5B96E', // amber-400
    600: '#D4A84F',
    700: '#B88F3E',
    800: '#9C762D',
    900: '#805D1C',
  },

  // Semantic colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E', // green-500
    700: '#15803D',
  },

  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444', // red-500
    700: '#B91C1C',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B', // amber-500
    700: '#B45309',
  },

  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Concern-specific colors
  concern: {
    acne: {
      light: '#FEF3E5',
      DEFAULT: '#E5B96E',
      dark: '#B88F3E',
    },
    pigmentation: {
      light: '#FEF3E5',
      DEFAULT: '#E5B96E',
      dark: '#B88F3E',
    },
    texture: {
      light: '#FEF3E5',
      DEFAULT: '#E5B96E',
      dark: '#B88F3E',
    },
    scarring: {
      light: '#F3E8FF',
      DEFAULT: '#A855F7', // purple-500
      dark: '#7E22CE',
    },
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.375rem',   // 6px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',
} as const;

export const typography = {
  fontFamily: {
    display: 'Playfair Display, serif',
    body: 'Manrope, sans-serif',
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
