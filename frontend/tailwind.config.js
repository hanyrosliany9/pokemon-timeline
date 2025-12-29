/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      // ================================================================
      // BREAKPOINTS
      // ================================================================
      screens: {
        'xs': '480px',   // Mobile landscape
        'sm': '640px',   // Tablet portrait
        'md': '768px',   // Tablet landscape
        'lg': '1024px',  // Laptop
        'xl': '1280px',  // Desktop
        '2xl': '1536px', // Large desktop
      },

      // ================================================================
      // TYPOGRAPHY
      // ================================================================
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        // iOS 16 Typography Scale
        'ios-large-title': ['2.125rem', { lineHeight: '2.5625rem', fontWeight: '700' }],
        'ios-title-1': ['1.75rem', { lineHeight: '2.125rem', fontWeight: '700' }],
        'ios-title-2': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'ios-title-3': ['1.25rem', { lineHeight: '1.5625rem', fontWeight: '600' }],
        'ios-headline': ['1.0625rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        'ios-body': ['1.0625rem', { lineHeight: '1.375rem', fontWeight: '400' }],
        'ios-callout': ['1rem', { lineHeight: '1.3125rem', fontWeight: '400' }],
        'ios-subheadline': ['0.9375rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'ios-footnote': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '400' }],
        'ios-caption-1': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
        'ios-caption-2': ['0.6875rem', { lineHeight: '0.8125rem', fontWeight: '400' }],
      },

      // ================================================================
      // COLORS - Unified Design System
      // ================================================================
      colors: {
        // Semantic backgrounds (auto dark mode via CSS vars)
        'bg-primary': 'hsl(var(--background-primary) / <alpha-value>)',
        'bg-secondary': 'hsl(var(--background-secondary) / <alpha-value>)',
        'bg-tertiary': 'hsl(var(--background-tertiary) / <alpha-value>)',
        'bg-elevated': 'hsl(var(--background-elevated) / <alpha-value>)',

        // Semantic text
        'text-primary': 'hsl(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--text-secondary) / <alpha-value>)',
        'text-tertiary': 'hsl(var(--text-tertiary) / <alpha-value>)',
        'text-inverse': 'hsl(var(--text-inverse) / <alpha-value>)',

        // Status/semantic colors
        'success': 'hsl(var(--status-success) / <alpha-value>)',
        'warning': 'hsl(var(--status-warning) / <alpha-value>)',
        'error': 'hsl(var(--status-error) / <alpha-value>)',
        'info': 'hsl(var(--status-info) / <alpha-value>)',

        // Financial colors
        'income': 'hsl(var(--financial-income) / <alpha-value>)',
        'expense': 'hsl(var(--financial-expense) / <alpha-value>)',
        'crypto': 'hsl(var(--financial-crypto) / <alpha-value>)',

        // Chart palette
        chart: {
          '1': 'hsl(var(--chart-1) / <alpha-value>)',
          '2': 'hsl(var(--chart-2) / <alpha-value>)',
          '3': 'hsl(var(--chart-3) / <alpha-value>)',
          '4': 'hsl(var(--chart-4) / <alpha-value>)',
          '5': 'hsl(var(--chart-5) / <alpha-value>)',
        },

        // Interactive elements
        'interactive': 'hsl(var(--interactive-primary) / <alpha-value>)',
        'interactive-hover': 'hsl(var(--interactive-primary-hover) / <alpha-value>)',
        'interactive-destructive': 'hsl(var(--interactive-destructive) / <alpha-value>)',

        // Shadcn/UI compatibility (required)
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',

        // Sidebar specific (dark themed)
        sidebar: {
          DEFAULT: 'hsl(var(--background-primary) / <alpha-value>)',
          foreground: 'hsl(var(--text-primary) / <alpha-value>)',
          muted: 'hsl(var(--text-tertiary) / <alpha-value>)',
          border: 'hsl(var(--border-default) / 0.1)',
        },
      },

      // ================================================================
      // SPACING
      // ================================================================
      spacing: {
        'xs': '0.25rem',  // 4px
        'sm': '0.5rem',   // 8px
        'md': '1rem',     // 16px
        'lg': '1.5rem',   // 24px
        'xl': '2rem',     // 32px
      },

      // ================================================================
      // SHADOWS
      // ================================================================
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'card': 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        // iOS style shadows
        'ios-1': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'ios-2': '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        'ios-3': '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
      },

      // ================================================================
      // BORDER RADIUS
      // ================================================================
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      // ================================================================
      // TRANSITIONS
      // ================================================================
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.36, 0.66, 0.04, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // ================================================================
      // BACKDROP BLUR
      // ================================================================
      backdropBlur: {
        'thin': '10px',
        'regular': '20px',
        'thick': '30px',
      },

      // ================================================================
      // ANIMATIONS
      // ================================================================
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
}
