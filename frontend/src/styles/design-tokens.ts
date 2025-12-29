/**
 * Pokemon Timeline Design Tokens
 *
 * Centralized design system tokens for consistent styling across the application.
 * These tokens map to CSS custom properties defined in index.css.
 *
 * Usage:
 * - Import tokens in components: import { colors, spacing } from '@/styles/design-tokens'
 * - Use with inline styles or pass to third-party libraries (like Recharts)
 * - Prefer Tailwind classes when possible, use tokens for dynamic values
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

/**
 * Semantic color tokens that automatically adapt to light/dark mode
 * via CSS custom properties
 */
export const colors = {
  // Background Layers (lightest to darkest in light mode, reversed in dark)
  background: {
    primary: 'hsl(var(--background-primary))',
    secondary: 'hsl(var(--background-secondary))',
    tertiary: 'hsl(var(--background-tertiary))',
    elevated: 'hsl(var(--background-elevated))',
  },

  // Text Hierarchy
  text: {
    primary: 'hsl(var(--text-primary))',
    secondary: 'hsl(var(--text-secondary))',
    tertiary: 'hsl(var(--text-tertiary))',
    inverse: 'hsl(var(--text-inverse))',
  },

  // Status/Semantic Colors
  status: {
    success: 'hsl(var(--status-success))',
    warning: 'hsl(var(--status-warning))',
    error: 'hsl(var(--status-error))',
    info: 'hsl(var(--status-info))',
  },

  // Financial-specific Colors
  financial: {
    income: 'hsl(var(--financial-income))',
    expense: 'hsl(var(--financial-expense))',
    crypto: 'hsl(var(--financial-crypto))',
  },

  // Chart Colors (for Recharts and other chart libraries)
  chart: {
    1: 'hsl(var(--chart-1))',
    2: 'hsl(var(--chart-2))',
    3: 'hsl(var(--chart-3))',
    4: 'hsl(var(--chart-4))',
    5: 'hsl(var(--chart-5))',
  },

  // Interactive Elements
  interactive: {
    primary: 'hsl(var(--interactive-primary))',
    primaryHover: 'hsl(var(--interactive-primary-hover))',
    secondary: 'hsl(var(--interactive-secondary))',
    destructive: 'hsl(var(--interactive-destructive))',
  },

  // Borders
  border: {
    default: 'hsl(var(--border-default))',
    muted: 'hsl(var(--border-muted))',
    focus: 'hsl(var(--border-focus))',
  },
} as const

/**
 * Raw color values for use cases where CSS variables don't work
 * (e.g., some chart libraries, canvas drawing)
 *
 * IMPORTANT: These don't auto-switch with dark mode!
 * Use getComputedStyle for runtime theme detection when needed.
 */
export const rawColors = {
  // Light mode values
  light: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    income: '#10b981',
    expense: '#ef4444',
    crypto: '#8b5cf6',
    chart: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
  },
  // Dark mode values (slightly adjusted for dark backgrounds)
  dark: {
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
    income: '#34d399',
    expense: '#f87171',
    crypto: '#a78bfa',
    chart: ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f87171'],
  },
} as const

// ============================================================================
// SPACING TOKENS
// ============================================================================

/**
 * Spacing scale based on 4px base unit
 * Maps to Tailwind's spacing scale
 */
export const spacing = {
  0: '0',
  0.5: '2px',   // 0.125rem
  1: '4px',     // 0.25rem
  1.5: '6px',   // 0.375rem
  2: '8px',     // 0.5rem
  2.5: '10px',  // 0.625rem
  3: '12px',    // 0.75rem
  3.5: '14px',  // 0.875rem
  4: '16px',    // 1rem
  5: '20px',    // 1.25rem
  6: '24px',    // 1.5rem
  7: '28px',    // 1.75rem
  8: '32px',    // 2rem
  9: '36px',    // 2.25rem
  10: '40px',   // 2.5rem
  11: '44px',   // 2.75rem
  12: '48px',   // 3rem
  14: '56px',   // 3.5rem
  16: '64px',   // 4rem
} as const

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Fira Code", Consolas, monospace',
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const radius = {
  none: '0',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  elevated: '0 4px 16px rgba(0, 0, 0, 0.12)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
} as const

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '450ms',
  },
  timing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.36, 0.66, 0.04, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get chart colors array based on current theme
 * Useful for Recharts and similar libraries
 */
export function getChartColors(isDark = false): string[] {
  return isDark ? [...rawColors.dark.chart] : [...rawColors.light.chart]
}

/**
 * Get a specific chart color
 */
export function getChartColor(index: number, isDark = false): string {
  const colors = getChartColors(isDark)
  return colors[index % colors.length]
}

/**
 * Create a CSS variable reference with optional alpha
 */
export function withAlpha(cssVar: string, alpha: number): string {
  // Extract the variable name from hsl(var(--name))
  const match = cssVar.match(/var\((--[\w-]+)\)/)
  if (match) {
    return `hsl(var(${match[1]}) / ${alpha})`
  }
  return cssVar
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorToken = typeof colors
export type SpacingToken = keyof typeof spacing
export type FontSizeToken = keyof typeof typography.fontSize
export type FontWeightToken = keyof typeof typography.fontWeight
export type RadiusToken = keyof typeof radius
export type ShadowToken = keyof typeof shadows
export type BreakpointToken = keyof typeof breakpoints
