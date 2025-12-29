# Pokemon Timeline - Developer Guide

## Project Overview
Real-time Pokemon card project timeline & expense tracker with dual-currency support (USDT/IDR), live exchange rates, and WebSocket synchronization.

**Tech Stack**: React 19 + Vite | NestJS | PostgreSQL + Prisma | Redis | Socket.io

---

## Directory Structure

```
pokemon-timeline/
├── shared/          → TypeScript enums & types (currency, categories, statuses)
├── backend/         → NestJS API (timeline, expenses, currency, websocket modules)
├── frontend/        → React SPA (Zustand state, components, services)
└── docker-compose   → PostgreSQL, Redis containers
```

---

## Key Models & Features

### Timeline Events
- CRUD operations with status tracking (PENDING, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED)
- Task dependencies (parent-child relationships)
- Progress tracking (0-100%), priority levels (0-5)
- Event types: MILESTONE, TASK, DEADLINE, MEETING, DELIVERY

### Expenses
- Categories: CROPPING, MOTION_WORK, TOOLS, SOFTWARE, HARDWARE, OUTSOURCING, MISCELLANEOUS
- Dual-currency: USDT ↔ IDR with auto-conversion using Decimal.js (financial precision)
- Separate wallet tracking: display total USDT balance + total IDR balance independently
- Optional timeline event linking, receipt URLs, tags
- Statistics: total/average by currency, by category, by date

### Currency Exchange
- Real-time USDT-IDR rates via Binance (fallback: hardcoded 15500)
- 3-layer caching: Redis (5min) → PostgreSQL (1hr) → API
- Auto-refresh every 5 minutes (scheduled)

### Real-time Sync
- WebSocket via Socket.io + Redis pub/sub (cross-device, cross-browser)
- Events: timeline/expense/currency changes broadcast to all clients

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST/GET | `/api/timeline` | Create/list events |
| PATCH/DELETE | `/api/timeline/:id` | Update/delete event |
| POST/GET | `/api/expense` | Create/list expenses |
| PATCH/DELETE | `/api/expense/:id` | Update/delete expense |
| GET | `/api/currency/rate` | Get USDT-IDR rate |
| POST | `/api/currency/convert` | Convert amounts |

---

## State Management (Zustand Slices)

- **TimelineSlice**: Events CRUD, filtering, stats
- **ExpenseSlice**: Expenses CRUD, getTotalUSDT(), getTotalIDR(), aggregations
- **CurrencySlice**: Current rate, preferred currency preference
- **UISlice**: Toasts, modals, loading states

Middleware: `devtools` (Redux DevTools), `persist` (localStorage for preferences)

---

## Frontend Components

### Layout
- `Layout.tsx` - Main container with sidebar/header
- `Header.tsx` - Navigation, stats display
- `Sidebar.tsx` - View switcher (Timeline/Expenses/Dashboard)

### Timeline
- `TimelineView.tsx` - Event list with sort controls
- `TimelineEventCard.tsx` - Event display with status badges, progress bar

### Expenses (Recently Added)
- `ExpenseDashboard.tsx` - Main view with "Add Expense" button
- `WalletBalance.tsx` - USDT & IDR balance cards (separate wallets)
- `AddExpenseModal.tsx` - Form to create expenses
- `ExpenseCard.tsx` - Expense item with delete button + confirmation
- `ExpenseList.tsx` - Sortable expense list
- `ExpenseStats.tsx` - Statistics visualization (Recharts)

### Common
- `CurrencyToggle.tsx` - USDT/IDR display preference switch
- `Toast.tsx` - Notification system

---

## Backend Services

### TimelineService
- Create/update/delete events with validation
- Query filtering (status, type, date range)

### ExpenseService
- Create/update/delete with auto-currency conversion
- Calculate stats (total/average USDT/IDR)
- Filter by category, date, currency

### CurrencyService
- Fetch rates from Binance (ioredis for Redis ops)
- Cache management (Redis → PostgreSQL → API fallback)
- Scheduled refresh task (every 5 min)

### WebSocketGateway
- Socket.io connection management
- Redis pub/sub listener (forwards all events to connected clients)
- Automatic reconnection handling

---

## Development Commands

```bash
# Setup
npm install
npm run build:shared

# Run (Docker)
npm run dev                    # Start containers + logs
npm run dev:logs             # View logs
npm run dev:down             # Stop containers

# Database
docker exec pokemon-timeline-backend-dev npx prisma migrate dev
docker exec -it pokemon-timeline-db-dev psql -U pokemon_user -d pokemon_timeline

# Rebuild
npm run dev:rebuild          # Full rebuild
```

---

## Important Patterns

| Pattern | Usage | Benefit |
|---------|-------|---------|
| **Module DI** | NestJS modules | Clean separation |
| **Pub/Sub** | Redis channels → Socket.io broadcast | Real-time sync at scale |
| **3-Layer Cache** | Redis → PostgreSQL → API | Performance optimization |
| **Decimal.js** | All currency amounts | Financial precision (no float errors) |
| **Zustand Slices** | State management | Modular frontend state |
| **DTOs** | Input validation | Type safety + whitelist |

---

## Frontend Styling System

The frontend uses a **unified design token system** for consistent theming across light/dark modes.

### Architecture

```
design-tokens.ts  →  tailwind.config.js  →  Components
       ↓                    ↓
   index.css         Tailwind classes
 (CSS Variables)      (bg-*, text-*)
```

### Key Files

| File | Purpose |
|------|---------|
| `frontend/src/styles/design-tokens.ts` | TypeScript tokens for programmatic access |
| `frontend/src/index.css` | CSS variables (light/dark mode) |
| `frontend/tailwind.config.js` | Tailwind config using CSS vars |
| `frontend/STYLE_GUIDE.md` | Full styling documentation |

### Color Usage Rules

```tsx
// CORRECT - Use Tailwind semantic classes
<div className="bg-bg-secondary text-text-primary border-border">

// CORRECT - CSS variables in stylesheets
.card { background-color: hsl(var(--background-secondary)); }

// INCORRECT - Hardcoded colors
<div className="bg-[#1e2433]">  // NO!
.card { color: #f3f4f6; }       // NO!
```

### Common Tailwind Classes

| Purpose | Class |
|---------|-------|
| Main background | `bg-bg-primary` |
| Card background | `bg-bg-secondary` |
| Main text | `text-text-primary` |
| Secondary text | `text-text-secondary` |
| Border | `border-border` |
| Primary button | `bg-interactive text-white` |
| Success | `text-success` |
| Error | `text-error` |
| Income amounts | `text-income` |
| Expense amounts | `text-expense` |

### Chart Libraries (Recharts)

For libraries needing raw hex values:

```tsx
import { rawColors } from '@/styles/design-tokens'

const chartColor = isDark ? rawColors.dark.chart[0] : rawColors.light.chart[0]
```

---

## Common Tasks

### Add new expense field
1. Update `ExpenseCategory` enum in `shared/src/enums/category.enum.ts`
2. Update Prisma schema: `backend/prisma/schema.prisma`
3. Run migration: `docker exec backend-dev npx prisma migrate dev`
4. Update DTOs: `backend/src/expense/dto/`
5. Update frontend form: `frontend/src/components/expense/AddExpenseModal.tsx`

### Change currency pair
1. Update `CurrencyService.convertCurrency()` method
2. Modify rate fetch logic in Binance provider
3. Update cached conversion fields in Expense model

### Add WebSocket event
1. Emit in service: `this.redisService.publish(channel, data)`
2. Subscribe in gateway: `this.redisClient.subscribe(channel)`
3. Broadcast on frontend: WebSocket listener triggers Zustand updates

---

## Notes for Development

- **Wallet Balance**: Separate USDT/IDR wallet cards display totals from expense store (no duplicate state)
- **Currency Conversion**: Automatic on expense create/update via Binance API (3-layer caching)
- **Precision**: All amounts use Decimal(20,8) for crypto, Decimal(20,2) for fiat
- **Real-time**: Changes broadcast via Redis pub/sub to all connected WebSocket clients
- **Validation**: Backend uses `class-validator` + `ValidationPipe` for auto-whitelist
- **CORS**: Configured for `http://localhost:5173` (Vite frontend)
- **Logging**: NestJS Logger for backend, console for frontend (Zustand devtools available)

---

## File Locations - Quick Reference

| Component | Path |
|-----------|------|
| Enums | `shared/src/enums/` |
| Types | `shared/src/types/` |
| Timeline Module | `backend/src/timeline/` |
| Expense Module | `backend/src/expense/` |
| Currency Module | `backend/src/currency/` |
| WebSocket Gateway | `backend/src/websocket/` |
| Database Schema | `backend/prisma/schema.prisma` |
| Frontend Components | `frontend/src/components/` |
| Zustand Store | `frontend/src/store/` |
| API Services | `frontend/src/services/` |
