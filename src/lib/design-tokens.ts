/**
 * Design Tokens - Centralized constants for consistent styling
 * Eliminates magic strings and repeated values throughout the app
 */

// ============================================================================
// TRANSITION GRADIENTS
// ============================================================================
export const TRANSITION_GRADIENTS = {
  FEEDBACK: 'linear-gradient(135deg, #d6c49e 0%, #8e7cc3 100%)',
  CONSULTANT: 'linear-gradient(135deg, #c4b2ff 0%, #5b64d3 100%)',
  UPDATED_CONSULT: 'linear-gradient(135deg, #f0c892 0%, #caa45d 100%)',
  MACHINE_INTAKE: 'linear-gradient(135deg, #C1D2FF 0%, #6F82FF 100%)',
  ADMIN: 'linear-gradient(135deg, #2b364a 0%, #6f7d92 100%)',
} as const;

// ============================================================================
// SPACING & GAP PATTERNS
// ============================================================================
export const GAP_SIZES = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
  '2xl': 'gap-8',
} as const;

export const SPACE_Y_SIZES = {
  none: 'space-y-0',
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
  '2xl': 'space-y-12',
} as const;

// ============================================================================
// GRID LAYOUTS
// ============================================================================
export const GRID_LAYOUTS = {
  single: 'grid grid-cols-1',
  double: 'grid grid-cols-1 md:grid-cols-2',
  triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  quad: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  auto: 'grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
} as const;

// ============================================================================
// TEXT TRACKING (LETTER SPACING)
// ============================================================================
export const TEXT_TRACKING = {
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  caption: 'tracking-[0.28em]', // Used in captions
  label: 'tracking-[0.32em]', // Used in labels
} as const;

// ============================================================================
// SHADOW PATTERNS
// ============================================================================
export const SHADOW_PATTERNS = {
  // Base shadows
  subtle: 'shadow-md',
  medium: 'shadow-lg',
  elevated: 'shadow-xl',
  dramatic: 'shadow-2xl',

  // Glow effects (color-specific)
  glowPrimary: 'shadow-lg shadow-primary/30',
  glowPrimaryHover: 'hover:shadow-2xl hover:shadow-primary/50',
  glowAmber: 'shadow-lg shadow-amber-500/30',
  glowAmberHover: 'hover:shadow-2xl hover:shadow-amber-500/50',
  glowRed: 'shadow-lg shadow-red-500/30',
  glowRedHover: 'hover:shadow-2xl hover:shadow-red-500/50',
  glowGreen: 'shadow-lg shadow-green-500/30',
  glowGreenHover: 'hover:shadow-2xl hover:shadow-green-500/50',
  glowBlue: 'shadow-lg shadow-blue-500/30',
  glowBlueHover: 'hover:shadow-2xl hover:shadow-blue-500/50',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const BORDER_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
  full: 'rounded-full',
} as const;

// ============================================================================
// BLUR INTENSITIES
// ============================================================================
export const BLUR_SIZES = {
  none: 'blur-none',
  sm: 'blur-sm',
  md: 'blur-md',
  lg: 'blur-lg',
  xl: 'blur-xl',
  '2xl': 'blur-2xl',
  '3xl': 'blur-3xl',
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================
export const Z_INDEX = {
  base: 0,
  content: 10,
  elevated: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  transition: 9999,
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 700,
  transition: 600,
} as const;

// ============================================================================
// BREAKPOINTS (for reference in JS)
// ============================================================================
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ============================================================================
// SEMANTIC BADGE INTENTS
// ============================================================================
export const BADGE_INTENT = {
  LOW_RISK: 'success',
  MODERATE_RISK: 'warning',
  HIGH_RISK: 'danger',
  INFO: 'info',
  DEFAULT: 'default',
} as const;

// ============================================================================
// FORM FIELD SIZES
// ============================================================================
export const FORM_FIELD_HEIGHT = {
  sm: 'h-9',
  md: 'h-11',
  lg: 'h-13',
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================
export const ICON_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
} as const;

// ============================================================================
// TYPE EXPORTS FOR TYPESCRIPT
// ============================================================================
export type TransitionGradient = keyof typeof TRANSITION_GRADIENTS;
export type GapSize = keyof typeof GAP_SIZES;
export type GridLayout = keyof typeof GRID_LAYOUTS;
export type TextTracking = keyof typeof TEXT_TRACKING;
export type ShadowPattern = keyof typeof SHADOW_PATTERNS;
export type BorderRadius = keyof typeof BORDER_RADIUS;
export type BlurSize = keyof typeof BLUR_SIZES;
export type BadgeIntent = keyof typeof BADGE_INTENT;
