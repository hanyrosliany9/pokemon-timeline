# Pokemon Timeline Frontend Style Guide

This document describes the unified styling system for the Pokemon Timeline frontend.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STYLING ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐     ┌──────────────────┐                      │
│  │  design-tokens.ts │────▶│  tailwind.config │                      │
│  │  (TypeScript)    │     │  (Tailwind)       │                      │
│  └────────┬─────────┘     └────────┬─────────┘                      │
│           │                        │                                 │
│           ▼                        ▼                                 │
│  ┌──────────────────┐     ┌──────────────────┐                      │
│  │    index.css     │     │  Tailwind Classes │                      │
│  │  (CSS Variables) │     │  (bg-*, text-*)  │                      │
│  └────────┬─────────┘     └────────┬─────────┘                      │
│           │                        │                                 │
│           └────────────┬───────────┘                                │
│                        ▼                                            │
│               ┌──────────────────┐                                  │
│               │   Components     │                                  │
│               │  (React + CSS)   │                                  │
│               └──────────────────┘                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

| File | Purpose |
|------|---------|
| `src/styles/design-tokens.ts` | TypeScript token definitions for programmatic access |
| `src/index.css` | CSS custom properties (variables) for both light/dark themes |
| `tailwind.config.js` | Tailwind configuration referencing CSS variables |
| `src/styles/modal.css` | Modal-specific styles using unified tokens |
| Component `.css` files | Component-scoped styles using unified tokens |

---

## Color System

### Semantic Color Categories

| Category | Light Mode | Dark Mode | Usage |
|----------|------------|-----------|-------|
| `--background-primary` | White | Dark slate | Main app background |
| `--background-secondary` | Light gray | Darker slate | Cards, panels |
| `--background-tertiary` | Lighter gray | Even darker | Input backgrounds |
| `--text-primary` | Dark gray | White | Main text |
| `--text-secondary` | Medium gray | Light gray | Secondary text |
| `--text-tertiary` | Light gray | Dim gray | Muted text |
| `--border-default` | Light border | Dark border | Standard borders |
| `--interactive-primary` | Blue | Blue | Buttons, links |
| `--status-success` | Green | Light green | Success states |
| `--status-error` | Red | Light red | Error states |
| `--status-warning` | Amber | Light amber | Warning states |

### Using Colors in CSS

```css
/* CORRECT - Use hsl() wrapper with CSS variables */
.element {
  background-color: hsl(var(--background-secondary));
  color: hsl(var(--text-primary));
  border: 1px solid hsl(var(--border-default));
}

/* CORRECT - Use with alpha */
.element:hover {
  background-color: hsl(var(--interactive-primary) / 0.1);
}

/* INCORRECT - Don't use hardcoded colors */
.element {
  background-color: #1e2433;  /* NO! */
  color: #f3f4f6;             /* NO! */
}
```

### Using Colors in Tailwind

```tsx
// CORRECT - Use semantic Tailwind classes
<div className="bg-bg-secondary text-text-primary border-border">

// CORRECT - Status colors
<span className="text-success">Success</span>
<span className="text-error">Error</span>

// INCORRECT - Hardcoded arbitrary values
<div className="bg-[#1e2433]">  {/* NO! */}
```

### Using Colors in TypeScript

```tsx
import { rawColors } from '@/styles/design-tokens'

// For chart libraries that need raw hex values
const chartColors = isDark ? rawColors.dark.chart : rawColors.light.chart
```

---

## Tailwind Color Reference

| Tailwind Class | CSS Variable | Usage |
|----------------|--------------|-------|
| `bg-bg-primary` | `--background-primary` | Main background |
| `bg-bg-secondary` | `--background-secondary` | Cards |
| `bg-bg-tertiary` | `--background-tertiary` | Inputs |
| `text-text-primary` | `--text-primary` | Main text |
| `text-text-secondary` | `--text-secondary` | Secondary text |
| `text-text-tertiary` | `--text-tertiary` | Muted text |
| `border-border` | `--border-default` | Borders |
| `text-interactive` | `--interactive-primary` | Links |
| `bg-interactive` | `--interactive-primary` | Buttons |
| `text-success` | `--status-success` | Success |
| `text-error` | `--status-error` | Errors |
| `text-warning` | `--status-warning` | Warnings |
| `text-income` | `--accent-income` | Income amounts |
| `text-expense` | `--accent-expense` | Expense amounts |
| `text-crypto` | `--accent-crypto` | Crypto amounts |

---

## Spacing System

Use Tailwind's default spacing scale (based on 4px units):

| Class | Value | Example |
|-------|-------|---------|
| `p-1` | 4px | Small padding |
| `p-2` | 8px | Compact padding |
| `p-4` | 16px | Standard padding |
| `p-6` | 24px | Card padding |
| `gap-2` | 8px | Compact gap |
| `gap-4` | 16px | Standard gap |
| `gap-6` | 24px | Section gap |

---

## Border Radius Tokens

| CSS Variable | Value | Usage |
|--------------|-------|-------|
| `--radius-sm` | 0.25rem | Small elements, badges |
| `--radius-md` | 0.5rem | Buttons, inputs |
| `--radius-lg` | 0.75rem | Cards, modals |
| `--radius-xl` | 1rem | Large containers |
| `--radius-full` | 9999px | Circular elements |

```css
.card {
  border-radius: var(--radius-lg);
}
```

---

## Shadow Tokens

| CSS Variable | Usage |
|--------------|-------|
| `--shadow-default` | Subtle elevation |
| `--shadow-elevated` | Modals, dropdowns |
| `--shadow-glow` | Focus states |

```css
.modal {
  box-shadow: var(--shadow-elevated);
}
```

---

## Dark Mode

Dark mode is handled automatically via the `.dark` class on the `<html>` element.

```css
/* Light mode (default) */
:root {
  --background-primary: 0 0% 100%;
}

/* Dark mode (automatic) */
.dark {
  --background-primary: 222 47% 11%;
}
```

All components using CSS variables will automatically adapt to the theme.

---

## Component Patterns

### Card Component

```css
.card {
  background-color: hsl(var(--background-secondary));
  border: 1px solid hsl(var(--border-default));
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.card:hover {
  border-color: hsl(var(--interactive-primary));
  box-shadow: 0 4px 12px hsl(var(--interactive-primary) / 0.1);
}
```

### Button Variants

```css
/* Primary Button */
.btn-primary {
  background-color: hsl(var(--interactive-primary));
  color: white;
}

.btn-primary:hover {
  background-color: hsl(var(--interactive-primary-hover));
}

/* Destructive Button */
.btn-delete {
  background-color: hsl(var(--status-error));
  color: white;
}

.btn-delete:hover {
  background-color: hsl(var(--interactive-destructive-hover));
}
```

### Form Inputs

```css
.input {
  background-color: hsl(var(--background-primary));
  border: 1px solid hsl(var(--border-default));
  color: hsl(var(--text-primary));
}

.input:focus {
  border-color: hsl(var(--interactive-primary));
  box-shadow: 0 0 0 3px hsl(var(--interactive-primary) / 0.1);
}
```

---

## Chart Colors

For libraries like Recharts that need raw hex values:

```tsx
import { rawColors } from '@/styles/design-tokens'
import { useStore } from '@/store/store'

function MyChart() {
  const { theme } = useStore()
  const isDark = theme === 'dark'

  // Get appropriate colors for current theme
  const chartColors = isDark ? rawColors.dark.chart : rawColors.light.chart

  return (
    <LineChart>
      <Line stroke={chartColors[0]} />
    </LineChart>
  )
}
```

---

## Migration Checklist

When adding new components, ensure:

1. **No hardcoded hex colors** - Use CSS variables or Tailwind classes
2. **Use semantic names** - `bg-bg-secondary` not `bg-slate-800`
3. **Dark mode compatible** - Variables auto-switch, verify both themes
4. **Consistent spacing** - Use Tailwind spacing scale
5. **Consistent radius** - Use `--radius-*` tokens
6. **Consistent shadows** - Use `--shadow-*` tokens

---

## Quick Reference

### Background Colors
```tsx
// Tailwind
className="bg-bg-primary"    // Main background
className="bg-bg-secondary"  // Cards
className="bg-bg-tertiary"   // Inputs

// CSS
background-color: hsl(var(--background-primary));
```

### Text Colors
```tsx
// Tailwind
className="text-text-primary"    // Main text
className="text-text-secondary"  // Secondary
className="text-text-tertiary"   // Muted

// CSS
color: hsl(var(--text-primary));
```

### Status Colors
```tsx
// Tailwind
className="text-success"  // Green
className="text-error"    // Red
className="text-warning"  // Amber
className="text-info"     // Blue

// CSS
color: hsl(var(--status-success));
```

### Interactive Colors
```tsx
// Tailwind
className="bg-interactive text-white"     // Primary button
className="hover:bg-interactive-hover"    // Hover state

// CSS
background-color: hsl(var(--interactive-primary));
```

---

## File Locations

| What | Where |
|------|-------|
| CSS Variables | `src/index.css` |
| TypeScript Tokens | `src/styles/design-tokens.ts` |
| Tailwind Config | `tailwind.config.js` |
| Modal Styles | `src/styles/modal.css` |
| Component CSS | `src/components/[name]/[Name].css` |
