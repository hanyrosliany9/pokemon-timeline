/**
 * Responsive Tailwind Classes Utilities
 * 2025 Modern UI/UX Design System
 * Helps maintain consistent responsive patterns across components
 */

export const RESPONSIVE_CLASSES = {
  // Grid patterns - mobile-first
  grid: {
    single: 'grid grid-cols-1',
    double: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    triple: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
    quad: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  },

  // Spacing - responsive padding/margins
  padding: {
    page: 'p-4 md:p-6 lg:p-8',
    card: 'p-4 md:p-6',
    section: 'px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10',
  },

  gap: {
    compact: 'gap-2',
    normal: 'gap-3 md:gap-4',
    relaxed: 'gap-4 md:gap-6',
    spacious: 'gap-6 md:gap-8',
  },

  // Typography - responsive sizing
  text: {
    h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl md:text-2xl lg:text-3xl font-bold',
    h3: 'text-lg md:text-xl lg:text-2xl font-semibold',
    h4: 'text-base md:text-lg font-semibold',
    body: 'text-sm md:text-base',
    small: 'text-xs md:text-sm',
  },

  // Flex patterns
  flex: {
    row: 'flex flex-row items-center',
    col: 'flex flex-col',
    rowMobile: 'flex flex-col sm:flex-row sm:items-center',
    between: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
  },

  // Buttons - responsive sizing
  button: {
    full: 'w-full sm:w-auto',
  },

  // Display utilities
  display: {
    mobileOnly: 'block md:hidden',
    tabletUp: 'hidden md:block',
    desktopUp: 'hidden lg:block',
  },
};

/**
 * Animation timing constants (2025 best practices)
 * Used with Framer Motion and CSS transitions
 */
export const ANIMATION_TIMING = {
  quick: 200,      // Button clicks, toggles, badge changes (ms)
  standard: 300,   // Card transitions, modal open/close
  data: 400,       // Chart updates, WebSocket data refresh
  complex: 500,    // View switching, timeline reorder (max)
};

/**
 * Breakpoint values matching tailwind.config.js
 */
export const BREAKPOINTS = {
  xs: 480,   // Mobile landscape
  sm: 640,   // Tablet portrait
  md: 768,   // Tablet landscape / desktop nav breakpoint
  lg: 1024,  // Laptop
  xl: 1280,  // Desktop
  '2xl': 1536, // Large desktop
};

/**
 * Get responsive grid classes based on item count
 */
export function getGridClasses(columnCount: number, maxColumns?: number): string {
  const colsMap: Record<number, string> = {
    1: RESPONSIVE_CLASSES.grid.single,
    2: RESPONSIVE_CLASSES.grid.double,
    3: RESPONSIVE_CLASSES.grid.triple,
    4: RESPONSIVE_CLASSES.grid.quad,
  };

  return colsMap[columnCount] || RESPONSIVE_CLASSES.grid.single;
}

/**
 * Determine if device is mobile based on media query
 * Hook-compatible for use in components
 */
export function useIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}
