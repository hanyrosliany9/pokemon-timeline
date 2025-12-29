# Pokemon Timeline - UI/UX/Layout Refactoring Plan

**Date**: December 28, 2025
**Project**: Pokemon Timeline (USDT/IDR Expense & Timeline Tracker)
**Tech Stack**: React 19 + Vite, shadcn/ui, Tailwind CSS, Zustand

---

## Executive Summary

This refactoring plan combines **codebase analysis** findings with **2025 modern UI/UX research** to transform the Pokemon Timeline project into a production-ready, mobile-first, accessible financial dashboard. The plan prioritizes high-impact improvements while maintaining the solid architectural foundation already in place.

**Current State**: Strong component library (shadcn/ui), thoughtful state management (Zustand), dark mode support, real-time WebSocket sync.

**Critical Gaps**: Minimal responsive design (only 1 file), accessibility issues (missing landmarks, ARIA labels), no URL routing, inconsistent styling approach.

**Timeline**: 4 weeks (phased rollout)
**Impact**: Mobile-ready, accessible, modern dashboard experience aligned with 2025 design trends.

---

## Table of Contents

1. [Codebase Analysis Summary](#1-codebase-analysis-summary)
2. [Modern UI/UX Research Findings](#2-modern-uiux-research-findings)
3. [Refactoring Strategy](#3-refactoring-strategy)
4. [Phase 1: Critical Foundations (Week 1)](#phase-1-critical-foundations-week-1)
5. [Phase 2: Component Enhancement (Week 2)](#phase-2-component-enhancement-week-2)
6. [Phase 3: Advanced Features (Week 3)](#phase-3-advanced-features-week-3)
7. [Phase 4: Polish & Performance (Week 4)](#phase-4-polish--performance-week-4)
8. [Design System Guidelines](#design-system-guidelines)
9. [Testing & Validation Checklist](#testing--validation-checklist)
10. [Resources & References](#resources--references)

---

## 1. Codebase Analysis Summary

### 1.1 Current Architecture Strengths

✅ **Modern Component Library**: shadcn/ui (Radix UI + Tailwind CSS)
✅ **Type Safety**: Full TypeScript coverage
✅ **State Management**: Zustand with devtools and persistence
✅ **Dark Mode**: Proper implementation with system preference
✅ **Real-time Sync**: WebSocket integration via Socket.io
✅ **Icon System**: Lucide React with centralized category icons
✅ **Advanced Filtering**: Comprehensive expense filters with clear feedback

### 1.2 Critical Gaps Identified

❌ **Responsive Design**: Only `/components/progress/Progress.css` has `@media` queries
❌ **Accessibility**: Missing semantic HTML (`<nav>`, `<main>`), ARIA labels, skip links
❌ **Routing**: No URL-based navigation (can't bookmark views, no browser history)
❌ **Missing File**: `Layout.css` imported but doesn't exist
❌ **Styling Inconsistency**: Hybrid approach (Tailwind + custom CSS + CSS variables)
❌ **Component Reusability**: Repeated patterns (modals, empty states, stat cards)

### 1.3 Key Files for Reference

| Purpose | File Path |
|---------|-----------|
| **Theme Tokens** | `/frontend/src/index.css` |
| **Tailwind Config** | `/frontend/tailwind.config.js` |
| **Layout System** | `/frontend/src/components/layout/Layout.tsx` |
| **State Management** | `/frontend/src/store/store.ts` |
| **shadcn Example** | `/frontend/src/components/ui/button.tsx` |
| **Complex Component** | `/frontend/src/components/expense/ExpenseDashboard.tsx` |
| **Responsive Reference** | `/frontend/src/components/progress/Progress.css` |

---

## 2. Modern UI/UX Research Findings

### 2.1 2025 Dashboard Design Trends

**Key Principles**:
1. **Simplicity Over Complexity**: Neutral bases (soft grays) + 1-2 bright accents (no more "rainbow dashboards")
2. **Mobile-First**: Fresh layouts optimized for small displays, not just shrunk desktop versions
3. **Real-Time Data**: Near-instant updates with color-coded badges and actionable insights
4. **Accessibility Standard**: Minimum 4.5:1 color contrast, keyboard navigation, screen reader support
5. **AI Integration**: Natural language queries, personalized dashboards (future consideration)

**Sources**: Medium, Fuselab Creative, DesignRush, UXPin (see References section)

### 2.2 Recommended Color Scheme (2025 Trends)

**Dark Mode Base** (Financial Dashboard Optimized):
```css
--bg-primary: #1a1d2e        /* Ebony clay - trust/stability */
--bg-secondary: #22283b      /* Slightly lighter for cards */
--bg-tertiary: #2d3548       /* Hover states */
--text-primary: #e4e6eb      /* High contrast white */
--text-secondary: #9ca3af    /* Muted gray */
--text-tertiary: #6b7280     /* Labels */
```

**Accent Colors** (Psychology-Driven):
```css
--success-green: #10b981     /* Completed tasks, positive balance, income */
--warning-yellow: #f59e0b    /* Delayed tasks, pending actions */
--error-red: #ef4444         /* Cancelled tasks, expenses, alerts */
--info-blue: #3b82f6         /* In-progress tasks, informational */
--crypto-purple: #8b5cf6     /* USDT-specific elements */
```

**Light Mode Base**:
```css
--bg-primary: #f9fafb        /* Soft gray (not pure white) */
--bg-secondary: #ffffff
--text-primary: #111827
--text-secondary: #6b7280
```

**Rationale**:
- Blue/Green → Trust, stability (financial apps)
- Purple → Crypto/digital currency
- Minimal palette (5-6 colors) → Reduced visual clutter

### 2.3 Component Library Recommendation

**Selected**: **Chakra UI** (migrate from shadcn/ui over time)

**Why Chakra UI**:
- ✅ Built-in dark mode (theme-based)
- ✅ Excellent accessibility (WCAG compliant)
- ✅ Responsive design utilities (`base`, `md`, `lg` props)
- ✅ Faster development velocity (less custom styling)
- ✅ 37.3k GitHub stars, 533k weekly downloads
- ✅ Minimalist, clean aesthetic (matches 2025 trends)

**Alternative**: **Stay with shadcn/ui** (also valid)
- Pros: Full customization control, no vendor lock-in
- Cons: Requires more manual responsive work

**Decision Point**: Week 2 (evaluate after Phase 1 responsive fixes)

### 2.4 Micro-interactions & Animation Guidelines

**Timing Standards** (2025 Best Practices):
```typescript
const ANIMATION_TIMING = {
  quick: 200,      // Button clicks, toggles, badge changes
  standard: 300,   // Card transitions, modal open/close
  data: 400,       // Chart updates, WebSocket data refresh
  complex: 500     // View switching, timeline reorder (max)
};
```

**Priority Animations for Pokemon Timeline**:
1. **Real-time balance updates**: Number transitions when expenses added/removed
2. **Status badge transitions**: Smooth color changes (PENDING → IN_PROGRESS)
3. **Delete actions**: Slide-out + fade animation
4. **Currency toggle**: Flip animation (USDT ↔ IDR)
5. **Chart loading**: Skeleton loaders (not spinners)

**Library**: **Framer Motion** (industry standard for React)
```bash
npm install framer-motion
```

### 2.5 Data Visualization Best Practices

**Interactive Chart Requirements**:
1. **Custom Tooltips**: Dark mode styled, multi-line data
2. **Click-to-filter**: Click chart segment → filter all data
3. **Responsive Charts**: Adapt to screen size (fewer data points on mobile)
4. **Accessibility**: Color + pattern combinations (not just color)

**Recharts Enhancements** (already in use):
- Add `ResponsiveContainer` for all charts
- Implement custom `<CustomTooltip />` component
- Add click handlers for interactive filtering
- Use consistent color palette from design tokens

---

## 3. Refactoring Strategy

### 3.1 Approach

**Philosophy**: **Incremental, Low-Risk, High-Impact**

1. **No Big-Bang Rewrites**: Refactor component-by-component
2. **Mobile-First CSS**: Add responsive classes to existing components (no removal of desktop styles)
3. **Parallel Implementation**: New components alongside old (gradual migration)
4. **Feature Flags**: Use environment variables to toggle new features
5. **Continuous Testing**: Test on real devices after each phase

### 3.2 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Mobile Usability** | 0% (not responsive) | 95% | Google Mobile-Friendly Test |
| **Accessibility Score** | ~60% (estimate) | 90%+ | axe DevTools audit |
| **Lighthouse Performance** | Unknown | 90+ | Chrome DevTools |
| **Component Reusability** | 40% (many duplicates) | 80% | Code coverage of shared components |
| **Animation Performance** | N/A | 60 FPS | Chrome Performance monitor |

### 3.3 Risk Mitigation

**Risks**:
1. **Breaking existing functionality** during refactor
2. **Scope creep** (adding features beyond UI/UX)
3. **Performance regression** from animations
4. **Inconsistent browser support** for new CSS

**Mitigation**:
1. **Git branches per phase**: `refactor/phase-1-responsive`, `refactor/phase-2-components`
2. **Component snapshot tests**: Use Vitest + Testing Library
3. **Performance budgets**: Monitor bundle size (max +50kb for animations)
4. **Browser testing matrix**: Chrome, Firefox, Safari (latest 2 versions)

---

## Phase 1: Critical Foundations (Week 1)

### Goal: Make app mobile-ready and fix critical issues

**Time Estimate**: 5-7 days
**Priority**: HIGH (blocks production deployment)

---

### Task 1.1: Implement Responsive Design System

**Files to Modify**:
- `/frontend/src/index.css`
- `/frontend/src/components/layout/Layout.tsx`
- `/frontend/src/components/layout/Header.tsx`
- `/frontend/src/components/layout/Sidebar.tsx`

**Actions**:

#### 1.1.1 Define Responsive Breakpoints

Add to `/frontend/tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '480px',   // Mobile landscape
        'sm': '640px',   // Tablet portrait
        'md': '768px',   // Tablet landscape
        'lg': '1024px',  // Laptop
        'xl': '1280px',  // Desktop
        '2xl': '1536px', // Large desktop
      },
    },
  },
}
```

#### 1.1.2 Create Mobile-First Layout

**Current Issue**: Sidebar always visible, taking space on mobile

**Solution**: Implement drawer pattern

**File**: `/frontend/src/components/layout/Layout.tsx`

```tsx
// Add state for mobile drawer
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isMobile, setIsMobile] = useState(false);

// Detect mobile on mount and resize
useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// Render logic
{isMobile ? (
  // Drawer overlay (shadcn Sheet component)
  <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
    <SheetContent side="left">
      <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
    </SheetContent>
  </Sheet>
) : (
  // Always visible sidebar (desktop)
  <Sidebar />
)}
```

**Responsive Classes to Add**:
```tsx
// Layout container
<div className="flex flex-col md:flex-row h-screen">

// Sidebar (desktop only)
<aside className="hidden md:block w-64 border-r">

// Main content area
<main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">

// Header hamburger (mobile only)
<Button
  className="md:hidden"
  variant="ghost"
  onClick={() => setIsSidebarOpen(true)}
  aria-label="Open navigation menu"
>
  <Menu className="h-5 w-5" />
</Button>
```

#### 1.1.3 Make Header Responsive

**File**: `/frontend/src/components/layout/Header.tsx`

**Changes**:
```tsx
// Mobile: Stack items vertically, hide some stats
<header className="border-b">
  <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">

    {/* Left: Title + Hamburger */}
    <div className="flex items-center gap-3">
      <Button className="md:hidden" ...>☰</Button>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
        {viewTitle}
      </h1>
    </div>

    {/* Middle: Stats badges (hide on mobile) */}
    <div className="hidden lg:flex items-center gap-2 flex-wrap">
      <Badge>Total: {stats.total}</Badge>
      <Badge>Completed: {stats.completed}</Badge>
      {/* More badges... */}
    </div>

    {/* Right: Toggles (always visible) */}
    <div className="flex items-center gap-2 md:ml-auto">
      <CurrencyToggle />
      <ThemeToggle />
    </div>
  </div>
</header>
```

#### 1.1.4 Responsive Utility Classes Library

Create `/frontend/src/lib/responsive-utils.ts`:
```typescript
export const RESPONSIVE_CLASSES = {
  // Grid patterns
  grid: {
    single: 'grid-cols-1',
    double: 'grid-cols-1 md:grid-cols-2',
    triple: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    quad: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },

  // Spacing
  padding: {
    page: 'p-4 md:p-6 lg:p-8',
    card: 'p-4 md:p-6',
  },

  // Typography
  text: {
    h1: 'text-2xl md:text-3xl lg:text-4xl',
    h2: 'text-xl md:text-2xl lg:text-3xl',
    h3: 'text-lg md:text-xl lg:text-2xl',
  },
};
```

**Testing Checklist**:
- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPad (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Verify sidebar drawer opens/closes on mobile
- [ ] Check header stats visibility at each breakpoint

---

### Task 1.2: Implement 2025 Color Scheme

**Files to Modify**:
- `/frontend/src/index.css`

**Actions**:

#### 1.2.1 Update CSS Variables

Replace existing color variables with 2025-optimized palette:

```css
/* /frontend/src/index.css */

@layer base {
  :root {
    /* ===== 2025 MODERN DARK MODE (DEFAULT) ===== */

    /* Background layers */
    --background: 26 29 46;        /* #1a1d2e - Ebony clay */
    --foreground: 228 230 235;     /* #e4e6eb - High contrast white */

    --card: 34 40 59;              /* #22283b - Slightly lighter */
    --card-foreground: 228 230 235;

    --popover: 45 53 72;           /* #2d3548 - Popovers/tooltips */
    --popover-foreground: 228 230 235;

    /* Text hierarchy */
    --muted: 45 53 72;             /* Muted background */
    --muted-foreground: 156 163 175; /* #9ca3af - Secondary text */

    /* Primary actions */
    --primary: 59 130 246;         /* #3b82f6 - Info blue */
    --primary-foreground: 255 255 255;

    /* Secondary actions */
    --secondary: 107 114 128;      /* #6b7280 - Neutral gray */
    --secondary-foreground: 228 230 235;

    /* Semantic colors */
    --destructive: 239 68 68;      /* #ef4444 - Error red */
    --destructive-foreground: 255 255 255;

    --success: 16 185 129;         /* #10b981 - Success green */
    --success-foreground: 255 255 255;

    --warning: 245 158 11;         /* #f59e0b - Warning yellow */
    --warning-foreground: 17 24 39;

    --info: 59 130 246;            /* #3b82f6 - Info blue */
    --info-foreground: 255 255 255;

    --crypto: 139 92 246;          /* #8b5cf6 - Crypto purple */
    --crypto-foreground: 255 255 255;

    /* Financial-specific */
    --income: 16 185 129;          /* #10b981 - Green for income */
    --expense: 239 68 68;          /* #ef4444 - Red for expense */

    /* Borders */
    --border: 45 53 72;
    --input: 45 53 72;
    --ring: 59 130 246;

    /* Chart colors (for Recharts) */
    --chart-1: 59 130 246;         /* Blue */
    --chart-2: 16 185 129;         /* Green */
    --chart-3: 245 158 11;         /* Yellow */
    --chart-4: 139 92 246;         /* Purple */
    --chart-5: 239 68 68;          /* Red */

    /* Radius */
    --radius: 0.5rem;
  }

  .light {
    /* ===== 2025 MODERN LIGHT MODE ===== */

    --background: 249 250 251;     /* #f9fafb - Soft gray (not pure white) */
    --foreground: 17 24 39;        /* #111827 - Dark text */

    --card: 255 255 255;           /* Pure white for cards */
    --card-foreground: 17 24 39;

    --popover: 255 255 255;
    --popover-foreground: 17 24 39;

    --muted: 243 244 246;          /* #f3f4f6 - Light gray */
    --muted-foreground: 107 114 128;

    --primary: 59 130 246;
    --primary-foreground: 255 255 255;

    --secondary: 243 244 246;
    --secondary-foreground: 17 24 39;

    /* Keep semantic colors same as dark mode */
    --destructive: 239 68 68;
    --success: 16 185 129;
    --warning: 245 158 11;
    --crypto: 139 92 246;
    --income: 16 185 129;
    --expense: 239 68 68;

    --border: 229 231 235;
    --input: 229 231 235;
    --ring: 59 130 246;
  }
}

/* ===== STATUS BADGE COLORS (Updated) ===== */
.status-pending {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400;
}

.status-in-progress {
  @apply bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400;
}

.status-completed {
  @apply bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400;
}

.status-delayed {
  @apply bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400;
}

.status-cancelled {
  @apply bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400;
}
```

#### 1.2.2 Update Component Styles

**Files to Update**:
1. `/frontend/src/components/expense/WalletBalance.tsx`:
   - Change income color: `text-green-600 dark:text-green-400`
   - Change expense color: `text-red-600 dark:text-red-400`

2. `/frontend/src/components/timeline/TimelineEventCard.tsx`:
   - Use new status badge classes

3. `/frontend/src/components/expense/ExpenseCard.tsx`:
   - Update category badge colors to match new palette

**Validation**:
- [ ] Run color contrast checker (4.5:1 minimum)
- [ ] Test both light and dark modes
- [ ] Verify status badges readable
- [ ] Check financial colors (green=income, red=expense) are distinct

---

### Task 1.3: Add Semantic HTML & Accessibility

**Files to Modify**: All layout components

**Actions**:

#### 1.3.1 Implement Semantic Landmarks

**File**: `/frontend/src/components/layout/Layout.tsx`

**Before**:
```tsx
<div className="layout">
  <div className="layout-header">...</div>
  <div className="layout-sidebar">...</div>
  <div className="layout-main">...</div>
</div>
```

**After**:
```tsx
<div className="layout">
  {/* Skip to main content link */}
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
  >
    Skip to main content
  </a>

  <header className="layout-header" role="banner">
    <Header />
  </header>

  <nav className="layout-sidebar" role="navigation" aria-label="Main navigation">
    <Sidebar />
  </nav>

  <main id="main-content" className="layout-main" role="main">
    {/* Content */}
  </main>
</div>
```

#### 1.3.2 Add ARIA Labels to Icon Buttons

**Pattern to Apply Everywhere**:
```tsx
// ❌ Bad (before)
<Button onClick={handleDelete}>
  <Trash2 className="h-4 w-4" />
</Button>

// ✅ Good (after)
<Button
  onClick={handleDelete}
  aria-label="Delete expense"
  title="Delete expense"
>
  <Trash2 className="h-4 w-4" />
  <span className="sr-only">Delete expense</span>
</Button>
```

**Files to Update**:
- All icon-only buttons in Header, Sidebar, ExpenseCard, TimelineEventCard

#### 1.3.3 Improve Form Accessibility

**File**: `/frontend/src/components/expense/AddExpenseDialog.tsx`

**Add**:
```tsx
// Associate error messages with inputs
<div>
  <Label htmlFor="amount">Amount *</Label>
  <Input
    id="amount"
    type="number"
    aria-required="true"
    aria-invalid={errors.amount ? 'true' : 'false'}
    aria-describedby={errors.amount ? 'amount-error' : undefined}
  />
  {errors.amount && (
    <p id="amount-error" className="text-sm text-destructive mt-1" role="alert">
      {errors.amount}
    </p>
  )}
</div>
```

#### 1.3.4 Make Toast Notifications Accessible

**File**: `/frontend/src/components/ui/toaster.tsx`

**Add**:
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="toast-container"
>
  {toasts.map(toast => (
    <Toast key={toast.id} {...toast} />
  ))}
</div>
```

**Accessibility Checklist**:
- [ ] Skip link works (test with Tab key)
- [ ] All icon buttons have aria-label
- [ ] Form errors associated with inputs
- [ ] Toast region has aria-live
- [ ] Semantic HTML: `<header>`, `<nav>`, `<main>` used
- [ ] Test with screen reader (NVDA/JAWS)

---

### Task 1.4: Fix Missing Layout.css Issue

**Problem**: `import './Layout.css'` in Layout.tsx but file doesn't exist

**Investigation Steps**:
1. Check if styles are in `/frontend/src/App.css` instead
2. If yes, move Layout-specific styles to new file
3. If no, remove import (styles likely inline or in Tailwind)

**Action**:

Create `/frontend/src/components/layout/Layout.css`:
```css
/* Mobile-first layout */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Desktop: sidebar + main side-by-side */
@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
}

.layout-main {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .layout-main {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .layout-main {
    padding: 2rem;
  }
}
```

---

### Task 1.5: Responsive Component Updates

**Priority Components** (highest traffic):

#### 1.5.1 ExpenseDashboard

**File**: `/frontend/src/components/expense/ExpenseDashboard.tsx`

```tsx
// Responsive grid for wallet balances
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <WalletBalance currency="USDT" />
  <WalletBalance currency="IDR" />
</div>

// Responsive actions row
<div className="flex flex-col sm:flex-row gap-3 mb-6">
  <Button className="w-full sm:w-auto">+ Add Expense</Button>
  <Button className="w-full sm:w-auto">+ Add Income</Button>
</div>

// Responsive stats grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <ExpenseStats type="total" />
  <ExpenseStats type="average" />
  <ExpenseStats type="net" />
</div>
```

#### 1.5.2 TimelineView

**File**: `/frontend/src/components/timeline/TimelineView.tsx`

```tsx
// Responsive header
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <h2 className="text-2xl md:text-3xl font-bold">Timeline Events</h2>
  <Button className="w-full sm:w-auto">+ Add Event</Button>
</div>

// Responsive filters
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
  <Select>...</Select>  {/* Status filter */}
  <Select>...</Select>  {/* Type filter */}
  <Select>...</Select>  {/* Sort filter */}
  <Button>Clear</Button>
</div>
```

#### 1.5.3 ExpenseCard

**File**: `/frontend/src/components/expense/ExpenseCard.tsx`

```tsx
<Card className="hover:shadow-md transition-shadow">
  {/* Mobile: Stack vertically, Desktop: Row layout */}
  <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">

    {/* Left section */}
    <div className="flex items-start gap-3 flex-1">
      <CategoryIcon category={expense.category} size="lg" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base md:text-lg truncate">
          {expense.description}
        </h3>
        <p className="text-sm text-muted-foreground">
          {formatDate(expense.date)}
        </p>
      </div>
    </div>

    {/* Right section: Amount + Actions */}
    <div className="flex items-center justify-between sm:justify-end gap-4">
      <div className="text-right">
        <p className="text-lg md:text-xl font-bold">
          {formatCurrency(expense.amount, expense.currency)}
        </p>
      </div>
      <Button variant="ghost" size="icon" aria-label="Delete expense">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>
```

---

### Phase 1 Deliverables

**Code Changes**:
- ✅ Responsive layout with mobile drawer
- ✅ 2025 color scheme implemented
- ✅ Semantic HTML landmarks
- ✅ ARIA labels on all interactive elements
- ✅ Fixed Layout.css issue
- ✅ Updated 6 priority components for responsive design

**Documentation**:
- Update README.md with responsive breakpoints
- Add accessibility guidelines to CLAUDE.md

**Testing**:
- [ ] Mobile usability test (375px, 768px, 1920px)
- [ ] axe DevTools audit (target: 0 critical issues)
- [ ] Screen reader test (NVDA/JAWS)
- [ ] Color contrast validation

**Git Branch**: `refactor/phase-1-responsive`
**PR Title**: "Phase 1: Mobile-First Responsive Design + Accessibility"

---

## Phase 2: Component Enhancement (Week 2)

### Goal: Add micro-interactions, improve component reusability, enhance data visualization

**Time Estimate**: 5-7 days
**Priority**: MEDIUM-HIGH (quality of life improvements)

---

### Task 2.1: Install Animation Library

**Action**:
```bash
cd frontend
npm install framer-motion
```

**Update `package.json` dependencies**:
```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

---

### Task 2.2: Add Micro-interactions

#### 2.2.1 Expense Card Enter/Exit Animations

**File**: `/frontend/src/components/expense/ExpenseCard.tsx`

```tsx
import { motion } from 'framer-motion';

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(expense.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        {/* Content */}
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete expense"
        >
          {isDeleting ? 'Deleting...' : <Trash2 />}
        </Button>
      </Card>
    </motion.div>
  );
}
```

**Wrap list in AnimatePresence**:

**File**: `/frontend/src/components/expense/ExpenseList.tsx`

```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="popLayout">
  {filteredExpenses.map(expense => (
    <ExpenseCard key={expense.id} expense={expense} />
  ))}
</AnimatePresence>
```

#### 2.2.2 Currency Toggle Flip Animation

**File**: `/frontend/src/components/currency/CurrencyToggle.tsx`

```tsx
import { motion } from 'framer-motion';

export function CurrencyToggle() {
  const { preferredCurrency, setPreferredCurrency } = useStore();

  return (
    <Button
      variant="outline"
      onClick={() => setPreferredCurrency(
        preferredCurrency === 'USDT' ? 'IDR' : 'USDT'
      )}
      className="relative overflow-hidden"
    >
      <motion.span
        key={preferredCurrency}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-block"
      >
        {preferredCurrency}
      </motion.span>
    </Button>
  );
}
```

#### 2.2.3 Number Transitions for Balance Updates

**File**: `/frontend/src/components/expense/WalletBalance.tsx`

```tsx
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function WalletBalance({ currency }: { currency: 'USDT' | 'IDR' }) {
  const { getTotalUSDT, getTotalIDR } = useStore();
  const total = currency === 'USDT' ? getTotalUSDT() : getTotalIDR();

  const spring = useSpring(total, { duration: 400 });
  const display = useTransform(spring, (latest) =>
    latest.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  useEffect(() => {
    spring.set(total);
  }, [total]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currency} Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.p className="text-3xl font-bold">
          {currency === 'USDT' ? '$' : 'Rp '}
          {display}
        </motion.p>
      </CardContent>
    </Card>
  );
}
```

#### 2.2.4 Status Badge Color Transitions

**File**: `/frontend/src/components/timeline/TimelineEventCard.tsx`

```tsx
import { motion } from 'framer-motion';

<motion.div
  layout
  className={`status-badge status-${event.status.toLowerCase()}`}
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.2 }}
>
  {event.status}
</motion.div>
```

---

### Task 2.3: Extract Reusable Components

#### 2.3.1 Create EmptyState Component

**New File**: `/frontend/src/components/common/EmptyState.tsx`

```tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

**Usage**:
```tsx
// In TimelineView.tsx
{sortedEvents.length === 0 && (
  <EmptyState
    icon={Calendar}
    title="No timeline events yet"
    description="Create your first event to get started tracking your project."
    action={{
      label: "Create First Event",
      onClick: () => setIsAddModalOpen(true)
    }}
  />
)}
```

#### 2.3.2 Create StatCard Component

**New File**: `/frontend/src/components/common/StatCard.tsx`

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  currency?: 'USDT' | 'IDR';
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function StatCard({
  label,
  value,
  currency,
  trend,
  icon: Icon,
  variant = 'default'
}: StatCardProps) {
  const variantColors = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>

        <motion.p
          className={`text-2xl md:text-3xl font-bold ${variantColors[variant]}`}
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {currency === 'USDT' && '$'}
          {currency === 'IDR' && 'Rp '}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </motion.p>

        {trend && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            {trend.direction === 'up' ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={trend.direction === 'up' ? 'text-success' : 'text-destructive'}>
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Usage**:
```tsx
// In ExpenseDashboard.tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatCard
    label="Total Expenses"
    value={getTotalUSDT()}
    currency="USDT"
    variant="error"
  />
  <StatCard
    label="Total Income"
    value={getTotalIncomeUSDT()}
    currency="USDT"
    variant="success"
  />
  <StatCard
    label="Net Balance"
    value={getNetBalanceUSDT()}
    currency="USDT"
    variant={getNetBalanceUSDT() >= 0 ? 'success' : 'error'}
    trend={{
      direction: getNetBalanceUSDT() >= 0 ? 'up' : 'down',
      value: `${Math.abs(getNetBalanceUSDT()).toFixed(2)}`
    }}
  />
</div>
```

#### 2.3.3 Create LoadingState Component

**New File**: `/frontend/src/components/common/LoadingState.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  type: 'card' | 'list' | 'stat' | 'chart';
  count?: number;
}

export function LoadingState({ type, count = 3 }: LoadingStateProps) {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return <Skeleton className="h-96 w-full rounded-lg" />;
  }

  return null;
}
```

**Usage**:
```tsx
// In ExpenseDashboard.tsx
{isLoading ? (
  <>
    <LoadingState type="stat" count={3} />
    <LoadingState type="card" count={5} />
  </>
) : (
  // Actual content
)}
```

---

### Task 2.4: Enhance Data Visualization

#### 2.4.1 Create Custom Tooltip Component

**New File**: `/frontend/src/components/charts/CustomTooltip.tsx`

```tsx
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 backdrop-blur-sm">
      <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
```

#### 2.4.2 Update ExpenseStats with Interactive Charts

**File**: `/frontend/src/components/expense/ExpenseStats.tsx`

```tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CustomTooltip } from '@/components/charts/CustomTooltip';
import { useState } from 'react';

export function ExpenseStats() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { expenses } = useStore();

  // Process data by category
  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { usdt: 0, idr: 0 };
      }
      acc[exp.category].usdt += parseFloat(exp.amountUSDT);
      acc[exp.category].idr += parseFloat(exp.amountIDR);
      return acc;
    }, {} as Record<string, { usdt: number; idr: number }>);

    return Object.entries(grouped).map(([category, amounts]) => ({
      name: category,
      category,
      USDT: amounts.usdt,
      IDR: amounts.idr,
    }));
  }, [expenses]);

  const handleBarClick = (data: any) => {
    setSelectedCategory(data.category);
    // Emit event to filter expense list
    window.dispatchEvent(new CustomEvent('filterByCategory', {
      detail: { category: data.category }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Clear filter: {selectedCategory}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={categoryData}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="USDT"
              fill="hsl(var(--crypto))"
              animationDuration={400}
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="IDR"
              fill="hsl(var(--info))"
              animationDuration={400}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

#### 2.4.3 Add Chart Loading Skeletons

Replace spinner in chart components with:
```tsx
{isLoading ? (
  <LoadingState type="chart" />
) : (
  <ResponsiveContainer>...</ResponsiveContainer>
)}
```

---

### Phase 2 Deliverables

**New Components**:
- ✅ EmptyState (reusable)
- ✅ StatCard (reusable)
- ✅ LoadingState (reusable)
- ✅ CustomTooltip (charts)

**Animations Added**:
- ✅ Expense card enter/exit (300ms)
- ✅ Currency toggle flip (300ms)
- ✅ Balance number transitions (400ms)
- ✅ Status badge scale (200ms)

**Chart Enhancements**:
- ✅ Custom dark mode tooltips
- ✅ Click-to-filter interaction
- ✅ Responsive containers
- ✅ Skeleton loading states

**Git Branch**: `refactor/phase-2-components`
**PR Title**: "Phase 2: Micro-interactions + Component Reusability + Chart Enhancements"

---

## Phase 3: Advanced Features (Week 3)

### Goal: Add URL routing, timeline view enhancements, advanced filtering improvements

**Time Estimate**: 5-7 days
**Priority**: MEDIUM (nice-to-have features)

---

### Task 3.1: Implement URL-Based Routing

#### 3.1.1 Install React Router

```bash
cd frontend
npm install react-router-dom @types/react-router-dom
```

#### 3.1.2 Update App Structure

**File**: `/frontend/src/App.tsx`

**Before**:
```tsx
<Layout />  // Layout manages view state internally
```

**After**:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/timeline" replace />} />
      <Route path="timeline" element={<TimelineView />} />
      <Route path="expenses" element={<ExpenseDashboard />} />
      <Route path="dashboard" element={<DashboardView />} />
      <Route path="*" element={<Navigate to="/timeline" replace />} />
    </Route>
  </Routes>
</BrowserRouter>
```

#### 3.1.3 Update Layout Component

**File**: `/frontend/src/components/layout/Layout.tsx`

**Remove**:
```tsx
const [currentView, setCurrentView] = useState<View>('timeline');
```

**Add**:
```tsx
import { Outlet } from 'react-router-dom';

// In JSX
<main id="main-content" className="layout-main">
  <Outlet />  {/* Renders current route */}
</main>
```

#### 3.1.4 Update Sidebar Navigation

**File**: `/frontend/src/components/layout/Sidebar.tsx`

**Before**:
```tsx
<Button onClick={() => setCurrentView('timeline')}>
  <Calendar /> Timeline
</Button>
```

**After**:
```tsx
import { NavLink } from 'react-router-dom';

<NavLink
  to="/timeline"
  className={({ isActive }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "hover:bg-muted"
    )
  }
>
  <Calendar className="h-4 w-4" />
  <span>Timeline</span>
</NavLink>
```

**Benefits**:
- ✅ Bookmarkable URLs (`/expenses`, `/timeline`)
- ✅ Browser back/forward support
- ✅ Deep linking capability
- ✅ Active state highlighting

---

### Task 3.2: Timeline View Enhancements

#### 3.2.1 Add View Switcher (Daily/Weekly/Monthly)

**File**: `/frontend/src/components/timeline/TimelineView.tsx`

```tsx
type ViewMode = 'daily' | 'weekly' | 'monthly';

const [viewMode, setViewMode] = useState<ViewMode>('weekly');

// View switcher UI
<div className="flex items-center gap-2 mb-6">
  <Button
    variant={viewMode === 'daily' ? 'default' : 'outline'}
    onClick={() => setViewMode('daily')}
  >
    Daily
  </Button>
  <Button
    variant={viewMode === 'weekly' ? 'default' : 'outline'}
    onClick={() => setViewMode('weekly')}
  >
    Weekly
  </Button>
  <Button
    variant={viewMode === 'monthly' ? 'default' : 'outline'}
    onClick={() => setViewMode('monthly')}
  >
    Monthly
  </Button>
</div>

// Group events by view mode
const groupedEvents = useMemo(() => {
  if (viewMode === 'daily') {
    return groupByDay(sortedEvents);
  } else if (viewMode === 'weekly') {
    return groupByWeek(sortedEvents);
  } else {
    return groupByMonth(sortedEvents);
  }
}, [sortedEvents, viewMode]);

// Render grouped events
{Object.entries(groupedEvents).map(([period, events]) => (
  <div key={period} className="mb-8">
    <h3 className="text-lg font-semibold mb-4">{period}</h3>
    <div className="space-y-3">
      {events.map(event => <TimelineEventCard key={event.id} event={event} />)}
    </div>
  </div>
))}
```

**Helper Functions**:
```tsx
function groupByDay(events: TimelineEvent[]) {
  return events.reduce((acc, event) => {
    const day = format(new Date(event.startDate), 'MMMM dd, yyyy');
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);
}

function groupByWeek(events: TimelineEvent[]) {
  return events.reduce((acc, event) => {
    const week = format(new Date(event.startDate), "'Week' w, yyyy");
    if (!acc[week]) acc[week] = [];
    acc[week].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);
}

function groupByMonth(events: TimelineEvent[]) {
  return events.reduce((acc, event) => {
    const month = format(new Date(event.startDate), 'MMMM yyyy');
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);
}
```

#### 3.2.2 Add Gantt-Style Visualization (Optional Advanced Feature)

**New File**: `/frontend/src/components/timeline/GanttView.tsx`

```tsx
import { Card } from '@/components/ui/card';
import { useMemo } from 'react';

export function GanttView({ events }: { events: TimelineEvent[] }) {
  const ganttData = useMemo(() => {
    const sortedByStart = [...events].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const earliest = new Date(sortedByStart[0].startDate);
    const latest = new Date(sortedByStart[sortedByStart.length - 1].endDate);
    const totalDays = differenceInDays(latest, earliest);

    return sortedByStart.map(event => {
      const start = differenceInDays(new Date(event.startDate), earliest);
      const duration = differenceInDays(new Date(event.endDate), new Date(event.startDate));

      return {
        ...event,
        startOffset: (start / totalDays) * 100,
        width: (duration / totalDays) * 100,
      };
    });
  }, [events]);

  return (
    <Card className="p-6">
      <div className="space-y-2">
        {ganttData.map(item => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="w-48 text-sm truncate">{item.title}</div>
            <div className="flex-1 relative h-8 bg-muted rounded-md">
              <div
                className={`absolute h-full rounded-md ${getStatusColor(item.status)}`}
                style={{
                  left: `${item.startOffset}%`,
                  width: `${item.width}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

---

### Task 3.3: Advanced Filtering Improvements

#### 3.3.1 Add Filter Persistence (LocalStorage)

**File**: `/frontend/src/components/expense/ExpenseFilters.tsx`

```tsx
import { useEffect } from 'react';

// Load filters from localStorage on mount
useEffect(() => {
  const savedFilters = localStorage.getItem('expenseFilters');
  if (savedFilters) {
    setFilters(JSON.parse(savedFilters));
  }
}, []);

// Save filters to localStorage on change
useEffect(() => {
  localStorage.setItem('expenseFilters', JSON.stringify(filters));
}, [filters]);
```

#### 3.3.2 Add Advanced Date Filters

**Add to Filters UI**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Quick date filters */}
  <div>
    <Label>Quick Filters</Label>
    <div className="flex flex-wrap gap-2 mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDateRange('today')}
      >
        Today
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDateRange('thisWeek')}
      >
        This Week
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDateRange('thisMonth')}
      >
        This Month
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDateRange('lastMonth')}
      >
        Last Month
      </Button>
    </div>
  </div>

  {/* Custom date range */}
  <div>
    <Label>Custom Range</Label>
    <div className="flex gap-2 mt-2">
      <Input type="date" placeholder="Start" />
      <Input type="date" placeholder="End" />
    </div>
  </div>
</div>
```

---

### Phase 3 Deliverables

**Routing**:
- ✅ React Router installed
- ✅ URL-based navigation (/timeline, /expenses, /dashboard)
- ✅ Active link highlighting
- ✅ Bookmarkable views

**Timeline Enhancements**:
- ✅ Daily/Weekly/Monthly view switcher
- ✅ Grouped event rendering
- ✅ (Optional) Gantt-style visualization

**Filtering**:
- ✅ Filter persistence (localStorage)
- ✅ Quick date filters (Today, This Week, etc.)
- ✅ Custom date range picker

**Git Branch**: `refactor/phase-3-features`
**PR Title**: "Phase 3: URL Routing + Timeline Views + Advanced Filtering"

---

## Phase 4: Polish & Performance (Week 4)

### Goal: Final optimizations, accessibility audit, performance tuning, documentation

**Time Estimate**: 5-7 days
**Priority**: LOW-MEDIUM (quality improvements)

---

### Task 4.1: Performance Optimization

#### 4.1.1 Implement Zustand Selectors

**Create**: `/frontend/src/store/selectors.ts`

```typescript
import { useStore } from './store';

// Currency selectors
export const usePreferredCurrency = () =>
  useStore(state => state.preferredCurrency);

export const useExchangeRate = () =>
  useStore(state => state.exchangeRate);

// Expense selectors
export const useExpenses = () =>
  useStore(state => state.expenses);

export const useTotalUSDT = () =>
  useStore(state => state.getTotalUSDT());

export const useTotalIDR = () =>
  useStore(state => state.getTotalIDR());

// Timeline selectors
export const useTimelineEvents = () =>
  useStore(state => state.events);

export const useTimelineStats = () =>
  useStore(state => ({
    total: state.events.length,
    completed: state.events.filter(e => e.status === 'COMPLETED').length,
    inProgress: state.events.filter(e => e.status === 'IN_PROGRESS').length,
    pending: state.events.filter(e => e.status === 'PENDING').length,
  }));
```

**Update Components**:
```tsx
// ❌ Before (re-renders on any store change)
const { preferredCurrency, getTotalUSDT } = useStore();

// ✅ After (only re-renders when specific values change)
const preferredCurrency = usePreferredCurrency();
const totalUSDT = useTotalUSDT();
```

#### 4.1.2 Add Lazy Loading for Heavy Components

**File**: `/frontend/src/App.tsx`

```tsx
import { lazy, Suspense } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

// Lazy load route components
const TimelineView = lazy(() => import('@/components/timeline/TimelineView'));
const ExpenseDashboard = lazy(() => import('@/components/expense/ExpenseDashboard'));
const DashboardView = lazy(() => import('@/components/dashboard/DashboardView'));

// Wrap routes in Suspense
<Routes>
  <Route path="/" element={<Layout />}>
    <Route
      path="timeline"
      element={
        <Suspense fallback={<LoadingState type="card" count={5} />}>
          <TimelineView />
        </Suspense>
      }
    />
    <Route
      path="expenses"
      element={
        <Suspense fallback={<LoadingState type="card" count={5} />}>
          <ExpenseDashboard />
        </Suspense>
      }
    />
  </Route>
</Routes>
```

#### 4.1.3 Optimize Recharts Bundle

**Install**: `recharts-to-png` for export functionality (if needed)

**Lazy load charts**:
```tsx
const ExpenseCharts = lazy(() => import('@/components/expense/ExpenseCharts'));

// In component
<Suspense fallback={<LoadingState type="chart" />}>
  <ExpenseCharts />
</Suspense>
```

#### 4.1.4 Add Pagination to Expense List

**File**: `/frontend/src/components/expense/ExpenseList.tsx`

```tsx
const ITEMS_PER_PAGE = 20;
const [currentPage, setCurrentPage] = useState(1);

const paginatedExpenses = useMemo(() => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredExpenses.slice(start, start + ITEMS_PER_PAGE);
}, [filteredExpenses, currentPage]);

const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);

// Pagination UI
<div className="flex items-center justify-between mt-6">
  <p className="text-sm text-muted-foreground">
    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredExpenses.length)} of {filteredExpenses.length}
  </p>
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    <Button
      variant="outline"
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
    >
      Next
    </Button>
  </div>
</div>
```

---

### Task 4.2: Accessibility Final Audit

#### 4.2.1 Run axe DevTools

**Action**:
1. Install axe DevTools Chrome extension
2. Run audit on each page (/timeline, /expenses, /dashboard)
3. Fix all critical and serious issues
4. Document remaining minor issues

**Common Fixes**:
- Add missing `alt` text to images (if any)
- Fix heading hierarchy (h1 → h2 → h3, no skips)
- Add `aria-label` to icon-only buttons
- Ensure focus indicators visible
- Check color contrast ratios

#### 4.2.2 Keyboard Navigation Test

**Test Scenarios**:
- [ ] Tab through all interactive elements (buttons, links, inputs)
- [ ] Open/close modals with keyboard (ESC to close)
- [ ] Submit forms with Enter key
- [ ] Navigate sidebar with Tab/Arrow keys
- [ ] Activate currency toggle with Space/Enter

**Fix any issues found**

#### 4.2.3 Screen Reader Testing

**Action**:
1. Download NVDA (Windows) or VoiceOver (Mac)
2. Test critical flows:
   - Add expense
   - Filter expenses
   - View timeline event
   - Toggle theme/currency
3. Ensure announcements make sense

**Common Fixes**:
- Add `aria-live="polite"` to dynamic content
- Ensure form errors announced
- Add descriptive button labels

---

### Task 4.3: Documentation Updates

#### 4.3.1 Update CLAUDE.md

**Add Section**: "UI/UX Design System"

```markdown
## UI/UX Design System (Post-Refactor)

### Component Library
- **Primary**: shadcn/ui (Radix UI + Tailwind CSS)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

### Design Tokens

**Colors** (2025 Dark Mode Optimized):
- Background: `#1a1d2e` (Ebony clay)
- Success: `#10b981` (Income, completed tasks)
- Error: `#ef4444` (Expenses, cancelled tasks)
- Info: `#3b82f6` (In-progress, informational)
- Crypto: `#8b5cf6` (USDT elements)

**Typography**:
- Font: System fonts (`-apple-system`, `Segoe UI`, `Roboto`)
- Scale: text-sm (0.875rem) → text-3xl (1.875rem)

**Spacing**:
- Base unit: 4px (Tailwind default)
- Page padding: `p-4 md:p-6 lg:p-8`

**Animations**:
- Quick: 200ms (clicks, toggles)
- Standard: 300ms (modals, cards)
- Data: 400ms (charts, balance updates)

### Responsive Breakpoints
- xs: 480px (Mobile landscape)
- sm: 640px (Tablet portrait)
- md: 768px (Tablet landscape)
- lg: 1024px (Laptop)
- xl: 1280px (Desktop)

### Accessibility
- WCAG AA compliant (4.5:1 contrast minimum)
- Keyboard navigation supported
- Screen reader tested (NVDA)
- Skip links implemented
```

#### 4.3.2 Create UI Component Guide

**New File**: `/frontend/docs/COMPONENTS.md`

```markdown
# Component Usage Guide

## Layout Components

### EmptyState
**Purpose**: Display when lists/data are empty

**Usage**:
\`\`\`tsx
<EmptyState
  icon={Calendar}
  title="No events yet"
  description="Create your first event to get started"
  action={{
    label: "Create Event",
    onClick: handleCreate
  }}
/>
\`\`\`

### StatCard
**Purpose**: Display key metrics with trends

**Usage**:
\`\`\`tsx
<StatCard
  label="Total Expenses"
  value={1234.56}
  currency="USDT"
  variant="error"
  trend={{ direction: 'down', value: '12%' }}
/>
\`\`\`

### LoadingState
**Purpose**: Show skeleton loaders during data fetch

**Usage**:
\`\`\`tsx
{isLoading ? (
  <LoadingState type="card" count={5} />
) : (
  <ExpenseList />
)}
\`\`\`

## Animation Guidelines

### Entry/Exit Animations
Use `framer-motion` for list items:
\`\`\`tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -100 }}
  transition={{ duration: 0.3 }}
>
  <Card />
</motion.div>
\`\`\`

### Number Transitions
For balance updates:
\`\`\`tsx
const spring = useSpring(total, { duration: 400 });
\`\`\`

## Best Practices

1. **Always use semantic HTML**: `<nav>`, `<main>`, `<header>`
2. **Add ARIA labels to icon buttons**: `aria-label="Delete expense"`
3. **Use responsive classes**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
4. **Implement loading states**: Use `<LoadingState>` instead of spinners
5. **Wrap animations in `AnimatePresence`**: For exit animations to work
```

#### 4.3.3 Update README.md

**Add Section**: "Responsive Design"

```markdown
## Responsive Design

This app is mobile-first and optimized for:
- **Mobile**: 375px - 767px (drawer navigation, stacked layouts)
- **Tablet**: 768px - 1023px (collapsible sidebar, 2-column grids)
- **Desktop**: 1024px+ (always-visible sidebar, 3-column grids)

### Testing Responsive Layouts

1. Chrome DevTools Device Mode (F12 → Toggle device toolbar)
2. Test on real devices (iPhone, iPad, Android)
3. Check breakpoints: 480px, 640px, 768px, 1024px, 1280px

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
```

---

### Task 4.4: Final Testing & Validation

#### 4.4.1 Lighthouse Audit

**Action**:
1. Open Chrome DevTools → Lighthouse tab
2. Run audit for each page
3. Target scores:
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 90+

**Common Optimizations**:
- Add `loading="lazy"` to images
- Minify CSS/JS (Vite does this)
- Add meta description
- Ensure contrast ratios pass

#### 4.4.2 Cross-Browser Testing

**Test Matrix**:

| Browser | Version | Desktop | Mobile |
|---------|---------|---------|--------|
| Chrome | Latest | ✅ | ✅ |
| Firefox | Latest | ✅ | ✅ |
| Safari | Latest | ✅ | ✅ |
| Edge | Latest | ✅ | N/A |

**Test Scenarios**:
1. Add/delete expense
2. Filter by category
3. Switch theme (light/dark)
4. Toggle currency (USDT/IDR)
5. View timeline events
6. Open/close modals

#### 4.4.3 Mobile Device Testing

**Real Device Tests**:
- iPhone SE (375px)
- iPhone 14 Pro (393px)
- iPad (768px)
- Android phone (360px-414px)

**Focus Areas**:
- Drawer sidebar opens/closes
- Forms are usable (inputs large enough)
- Touch targets at least 44x44px
- Charts are readable
- No horizontal scrolling

---

### Phase 4 Deliverables

**Performance**:
- ✅ Zustand selectors implemented
- ✅ Lazy loading for heavy components
- ✅ Pagination for expense list
- ✅ Recharts optimizations

**Accessibility**:
- ✅ axe DevTools audit (0 critical issues)
- ✅ Keyboard navigation verified
- ✅ Screen reader tested (NVDA)
- ✅ Focus indicators visible

**Documentation**:
- ✅ Updated CLAUDE.md with design system
- ✅ Created COMPONENTS.md usage guide
- ✅ Updated README.md with responsive info

**Testing**:
- ✅ Lighthouse scores 90+ across all metrics
- ✅ Cross-browser compatibility verified
- ✅ Mobile device testing complete

**Git Branch**: `refactor/phase-4-polish`
**PR Title**: "Phase 4: Performance Optimization + Accessibility Audit + Documentation"

---

## Design System Guidelines

### Color Usage Rules

**When to Use Each Color**:

| Color | Usage | Example |
|-------|-------|---------|
| **Success Green** (#10b981) | Positive outcomes, income, completed tasks | "Task completed", "Income: $500", Balance positive |
| **Error Red** (#ef4444) | Expenses, cancelled tasks, errors | "Expense: $100", "Task cancelled", Form errors |
| **Warning Yellow** (#f59e0b) | Delayed tasks, pending actions, warnings | "Task delayed", "Pending approval" |
| **Info Blue** (#3b82f6) | In-progress tasks, informational messages | "In progress", Tooltips, Help text |
| **Crypto Purple** (#8b5cf6) | USDT-specific elements, crypto features | USDT badge, Crypto wallet card |

### Typography Hierarchy

```
h1: text-2xl md:text-3xl lg:text-4xl (Page titles)
h2: text-xl md:text-2xl lg:text-3xl (Section titles)
h3: text-lg md:text-xl lg:text-2xl (Subsection titles)
body: text-base (Default text)
small: text-sm (Labels, captions)
tiny: text-xs (Metadata, timestamps)
```

### Spacing Scale

**Consistent Gap Sizes**:
- `gap-2` (0.5rem): Inline elements (icon + text)
- `gap-3` (0.75rem): Form fields
- `gap-4` (1rem): Card grids, list items
- `gap-6` (1.5rem): Section spacing
- `gap-8` (2rem): Major section dividers

### Component Variants

**Button Variants** (shadcn/ui):
- `default`: Primary actions (Add Expense, Submit)
- `destructive`: Delete, Cancel
- `outline`: Secondary actions (Filter, Sort)
- `ghost`: Icon buttons, less emphasis
- `link`: Text links

**Badge Variants**:
- Status badges: Use status-specific classes
- Category badges: Use category colors from icon system
- Count badges: Use muted variant

---

## Testing & Validation Checklist

### Pre-Launch Checklist

#### Functionality
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Real-time WebSocket updates functioning
- [ ] Currency conversion accurate
- [ ] Filters apply correctly
- [ ] Sorting works on all columns
- [ ] Forms validate inputs
- [ ] Error messages display properly

#### Responsive Design
- [ ] Mobile layout (375px-767px) works
- [ ] Tablet layout (768px-1023px) works
- [ ] Desktop layout (1024px+) works
- [ ] Sidebar drawer opens/closes on mobile
- [ ] No horizontal scrolling on any screen size
- [ ] Touch targets at least 44x44px
- [ ] Text readable at all sizes

#### Accessibility
- [ ] axe DevTools shows 0 critical issues
- [ ] Keyboard navigation works (Tab, Enter, ESC)
- [ ] Skip link functional
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Errors announced by screen readers
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators visible

#### Performance
- [ ] Lighthouse Performance score 90+
- [ ] Lighthouse Accessibility score 95+
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size reasonable (<500kb gzipped)
- [ ] Animations run at 60 FPS

#### Browser Compatibility
- [ ] Chrome (latest) works
- [ ] Firefox (latest) works
- [ ] Safari (latest) works
- [ ] Edge (latest) works
- [ ] Mobile Safari (iOS) works
- [ ] Mobile Chrome (Android) works

#### Data Integrity
- [ ] Currency conversions accurate
- [ ] Date ranges filter correctly
- [ ] Statistics calculations correct
- [ ] Chart data matches source
- [ ] WebSocket doesn't duplicate data

---

## Resources & References

### Codebase Analysis
**Source**: Internal code exploration agent (December 28, 2025)
- Complete component inventory
- Styling approach analysis
- Accessibility gap assessment
- Responsive design audit

### Modern UI/UX Research

#### Dashboard Design Trends (2025)
- [20 Principles Modern Dashboard UI/UX Design for 2025 | Medium](https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795)
- [Top Dashboard Design Trends for 2025 | Fuselab Creative](https://fuselabcreative.com/top-dashboard-design-trends-2025/)
- [10 Best UI/UX Dashboard Design Principles for 2025 | Medium](https://medium.com/@farazjonanda/10-best-ui-ux-dashboard-design-principles-for-2025-2f9e7c21a454)
- [9 Dashboard Design Principles (2025) | DesignRush](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles)

#### Timeline UI Patterns
- [UI Design Project Timeline: Design to Delivery - Twine Blog](https://www.twine.net/blog/ui-design-project-timeline-design-to-delivery/)
- [Calendar UI Examples: 33 Inspiring Designs | Eleken](https://www.eleken.co/blog-posts/calendar-ui)

#### Financial Dashboard Design
- [Best Color Palettes for Financial Dashboards - Phoenix Strategy Group](https://www.phoenixstrategy.group/blog/best-color-palettes-for-financial-dashboards)
- [Crypto Wallet UI Design Best Practices | IdeaSoft](https://ideasoft.io/blog/how-to-create-crypto-wallet-ui/)

#### Component Libraries (2025)
- [React UI libraries in 2025: Comparing shadcn/ui, Radix, Mantine, MUI, Chakra & more - Makers' Den](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra)
- [Top 10 Pre-Built React Frontend UI Libraries for 2025](https://www.supernova.io/blog/top-10-pre-built-react-frontend-ui-libraries-for-2025)

#### Micro-interactions & Animations
- [14 Micro-interaction Examples to Enhance UX](https://userpilot.com/blog/micro-interaction-examples/)
- [12 Micro Animation Examples Bringing Apps to Life in 2025](https://bricxlabs.com/blogs/micro-interactions-2025-examples)
- [The Psychology of Micro-Animations in 2025](https://almaxagency.com/design-trends/the-psychology-of-micro-animations-how-tiny-movements-drive-user-engagement-in-2025/)

#### Data Visualization
- [Dashboard Design: Best Practices & How-Tos 2025](https://improvado.io/blog/dashboard-design-guide)
- [10 Essential Data Visualization Best Practices for 2025](https://www.timetackle.com/data-visualization-best-practices/)
- [Data Visualization Tips and Best Practices | Tableau](https://www.tableau.com/visualization/data-visualization-best-practices)

#### Design Inspiration
- [Dashboard - Dribbble](https://dribbble.com/search/dashboard) (17,000+ designs)
- [60+ Dashboards, admin panels & analytics design inspiration | Muzli](https://muz.li/inspiration/dashboard-inspiration/)
- [370 Best Dashboards ideas in 2025 | Pinterest](https://www.pinterest.com/tmisel/dashboards/)

### Technical Documentation
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Recharts Documentation](https://recharts.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

### Accessibility Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Appendix: Migration Checklist

### Component Migration Tracker

**Phase 1 (Week 1)**:
- [ ] Layout.tsx (responsive grid)
- [ ] Header.tsx (mobile header)
- [ ] Sidebar.tsx (drawer implementation)
- [ ] ExpenseDashboard.tsx (responsive stats)
- [ ] TimelineView.tsx (responsive filters)
- [ ] ExpenseCard.tsx (mobile-friendly card)

**Phase 2 (Week 2)**:
- [ ] ExpenseCard.tsx (animations)
- [ ] CurrencyToggle.tsx (flip animation)
- [ ] WalletBalance.tsx (number transitions)
- [ ] TimelineEventCard.tsx (badge animations)
- [ ] ExpenseStats.tsx (interactive charts)
- [ ] Create EmptyState.tsx
- [ ] Create StatCard.tsx
- [ ] Create LoadingState.tsx
- [ ] Create CustomTooltip.tsx

**Phase 3 (Week 3)**:
- [ ] App.tsx (React Router)
- [ ] Layout.tsx (Outlet integration)
- [ ] Sidebar.tsx (NavLink)
- [ ] TimelineView.tsx (view switcher)
- [ ] ExpenseFilters.tsx (persistence)
- [ ] Create GanttView.tsx (optional)

**Phase 4 (Week 4)**:
- [ ] All components (selector migration)
- [ ] All route components (lazy loading)
- [ ] ExpenseList.tsx (pagination)
- [ ] All components (accessibility fixes)
- [ ] Documentation updates

---

## Final Notes

This refactoring plan transforms the Pokemon Timeline project from a desktop-first prototype into a **production-ready, mobile-first, accessible financial dashboard** aligned with 2025 design trends.

**Key Improvements**:
1. **Mobile-ready**: Responsive design from 375px to 1920px
2. **Accessible**: WCAG AA compliant, screen reader tested
3. **Modern UX**: Micro-interactions, smooth animations, intuitive navigation
4. **Performant**: Lazy loading, pagination, optimized bundle
5. **Maintainable**: Reusable components, clear documentation

**Timeline Summary**:
- Week 1: Critical foundations (responsive + accessibility)
- Week 2: Component enhancements (animations + reusability)
- Week 3: Advanced features (routing + timeline views)
- Week 4: Polish & performance (optimization + testing)

**Total Effort**: 20-28 days (4 weeks at 5-7 days/week)

**Expected Outcome**: A modern, polished financial dashboard that matches or exceeds industry standards for expense tracking and project timeline applications in 2025.

---

**Document Version**: 1.0
**Last Updated**: December 28, 2025
**Maintained By**: Development Team
**Review Cycle**: After each phase completion
