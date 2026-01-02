# Rendering Batch Estimator - Complete Implementation Plan

**Date:** 2026-01-02
**Status:** Ready for Implementation
**Primary Currency:** IDR (Indonesian Rupiah)

---

## Executive Summary

This feature solves the critical pain point of **batch decision-making** for a Pokemon card rendering business. When a new batch arrives (e.g., "2,300 cards, 2-day deadline"), the user needs instant answers:

- How many cloud GPUs do I need?
- What will it cost me?
- Is this batch profitable?

The solution extends existing CardProject infrastructure with minimal new models.

---

## Business Context

### Fixed Contract (Already Accepted)
```
Total Cards:     30,000
Price/Card:      0.13 USDT
Total Revenue:   3,900 USDT = Rp 65,094,900
Payment:         50% downpayment + 50% on completion
```

### Hardware Setup
```
Local GPU:   RTX 3060 Ti → 14 min/card, 300W, Rp 1,600/kWh
Cloud GPU:   RTX 5090 (Vast.ai) → 2.5 min/card, $0.36/hr
```

### Dynamic Batches
Company sends batches incrementally with deadlines until 30,000 cards delivered.

---

## Pain Points Solved

| # | Pain Point | Solution |
|---|------------|----------|
| 1 | "Can I meet this deadline? How many GPUs?" | Instant batch estimator with GPU calculation |
| 2 | "Cash flow shows negative but contract is profitable" | Separate projection view from cash flow |
| 3 | "Did my estimate match actual costs?" | Projected vs actual comparison per batch |
| 4 | "What's my overall contract status?" | Contract dashboard with profit projection |

---

## User Journeys

### Journey 1: Contract Setup (One-time)
Create project with title, total cards, and price per card.
System calculates contract value in IDR.

### Journey 2: GPU Configuration (One-time)
Configure local and cloud GPU specs, electricity rate.
Stored in browser localStorage.

### Journey 3: New Batch Arrives (Critical Path)
```
Input:  2,300 cards, 2 days deadline
Output:
  - GPU Plan: 2× RTX 5090 cloud + local
  - Cost: Rp 599,993
  - Profit: Rp 4,390,616 (88%)
Action: Create batch or adjust parameters
```

### Journey 4: Working on Batch
Track actual expenses linked to batch.
Real-time comparison: projected vs actual costs.

### Journey 5: Batch Completed
Final comparison showing estimate accuracy.
Learnings for future batches.

### Journey 6: Contract Dashboard
Overall progress, payment status, profit projection.

---

## Database Schema Changes

### 1. Extend CardProject (Add 1 field)

```prisma
model CardProject {
  // Existing fields - NO CHANGES
  id        String @id @default(uuid())
  title     String
  goalTotal Int
  progress  Int @default(0)

  // NEW: Price for rendering projects
  pricePerCardUSDT  Decimal? @db.Decimal(20, 8)

  // Existing relations
  expenses Expense[]
  entries  CardEntry[]

  // NEW relation
  batches  RenderingBatch[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Create RenderingBatch Model (New)

```prisma
model RenderingBatch {
  id              String      @id @default(uuid())
  projectId       String
  project         CardProject @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Batch Definition
  batchNumber         Int
  cardsCount          Int
  deadlineAt          DateTime

  // GPU Planning (snapshot at creation)
  useLocalGpu         Boolean @default(true)
  cloudGpusPlanned    Int
  cloudHoursPlanned   Decimal @db.Decimal(10, 2)

  // Exchange rate snapshot (for audit trail)
  exchangeRateUsed    Decimal @db.Decimal(20, 2)

  // Projections (all in IDR)
  projectedCloudCostIDR       Decimal @db.Decimal(20, 2)
  projectedElectricityCostIDR Decimal @db.Decimal(20, 2)
  projectedTotalCostIDR       Decimal @db.Decimal(20, 2)
  projectedRevenueIDR         Decimal @db.Decimal(20, 2)
  projectedProfitIDR          Decimal @db.Decimal(20, 2)
  projectedMarginPercent      Decimal @db.Decimal(5, 2)

  // Per-card metrics (IDR)
  projectedCostPerCardIDR     Decimal @db.Decimal(20, 2)
  projectedProfitPerCardIDR   Decimal @db.Decimal(20, 2)

  // Status & Timing
  status      BatchStatus @default(PENDING)
  startedAt   DateTime?
  completedAt DateTime?

  // Notes
  notes       String? @db.Text

  // Relations
  expenses    Expense[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([projectId, batchNumber])
  @@index([projectId])
  @@index([status])
  @@map("rendering_batches")
}

enum BatchStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### 3. Extend Expense Model (Add 1 field)

```prisma
model Expense {
  // ALL existing fields unchanged...
  id          String   @id @default(uuid())
  description String
  categoryId  String
  category    Category @relation(...)
  amount      Decimal  @db.Decimal(20, 8)
  currency    Currency
  amountUSDT  Decimal  @db.Decimal(20, 8)
  amountIDR   Decimal  @db.Decimal(20, 2)
  // ... other existing fields ...

  projectId   String?
  project     CardProject? @relation(...)

  // NEW: Optional batch link
  batchId     String?
  batch       RenderingBatch? @relation(fields: [batchId], references: [id], onDelete: SetNull)

  @@index([batchId])
}
```

---

## Frontend State (Zustand)

### GPU Config Slice (New)

```typescript
// frontend/src/store/slices/gpuConfig.slice.ts

export interface GpuConfig {
  local: {
    enabled: boolean
    name: string              // "RTX 3060 Ti"
    renderTimeMinutes: number // 14
    powerDrawWatts: number    // 300
  }
  cloud: {
    name: string              // "RTX 5090"
    renderTimeMinutes: number // 2.5
    costPerHourUSD: number    // 0.36
  }
  electricityRateIDR: number  // 1600
}

export interface GpuConfigSlice {
  gpuConfig: GpuConfig
  setGpuConfig: (config: Partial<GpuConfig>) => void
  setLocalGpu: (config: Partial<GpuConfig['local']>) => void
  setCloudGpu: (config: Partial<GpuConfig['cloud']>) => void
  setElectricityRate: (rate: number) => void
}

// Default values
const defaultGpuConfig: GpuConfig = {
  local: {
    enabled: true,
    name: 'RTX 3060 Ti',
    renderTimeMinutes: 14,
    powerDrawWatts: 300,
  },
  cloud: {
    name: 'RTX 5090',
    renderTimeMinutes: 2.5,
    costPerHourUSD: 0.36,
  },
  electricityRateIDR: 1600,
}
```

### Batch Slice (New)

```typescript
// frontend/src/store/slices/batch.slice.ts

export interface BatchSlice {
  batches: Record<string, RenderingBatch[]>  // keyed by projectId
  selectedBatch: RenderingBatch | null

  setBatches: (projectId: string, batches: RenderingBatch[]) => void
  addBatch: (batch: RenderingBatch) => void
  updateBatch: (batch: RenderingBatch) => void
  deleteBatch: (batchId: string, projectId: string) => void
  setSelectedBatch: (batch: RenderingBatch | null) => void

  // Computed
  getBatchesByProject: (projectId: string) => RenderingBatch[]
  getBatchActualCost: (batchId: string) => number  // Sum of linked expenses
  getProjectTotalProjectedCost: (projectId: string) => number
  getProjectTotalActualCost: (projectId: string) => number
}
```

### Store Integration

```typescript
// frontend/src/store/store.ts

// Add to imports
import { GpuConfigSlice, createGpuConfigSlice } from './slices/gpuConfig.slice'
import { BatchSlice, createBatchSlice } from './slices/batch.slice'

// Update Store type
export type Store = ProjectSlice & EntrySlice & CategorySlice & ExpenseSlice
  & CurrencySlice & UISlice & ThemeSlice & FilterState
  & GpuConfigSlice & BatchSlice  // ADD

// Add to create function
...createGpuConfigSlice(...a),
...createBatchSlice(...a),

// Update partialize for persistence
partialize: (state) => ({
  // Existing
  preferredCurrency: state.preferredCurrency,
  theme: state.theme,
  expenses: state.expenses,
  income: state.income,
  // NEW
  gpuConfig: state.gpuConfig,
}),
```

---

## Batch Calculation Service

```typescript
// frontend/src/services/batchCalculator.ts

import Decimal from 'decimal.js'

export interface BatchEstimateInput {
  cardsCount: number
  deadlineDays: number
  pricePerCardUSDT: number
  useLocalGpu: boolean
  gpuConfig: GpuConfig
  exchangeRateUSDTtoIDR: number
}

export interface BatchEstimate {
  // Feasibility
  isFeasible: boolean
  feasibilityNote: string

  // GPU Planning
  cardsPerDayRequired: number
  localGpuCardsPerDay: number
  cloudCardsPerDayNeeded: number
  cloudGpusRequired: number
  totalCloudHours: number
  totalLocalHours: number

  // Costs (IDR)
  cloudCostIDR: number
  electricityCostIDR: number
  totalCostIDR: number

  // Revenue & Profit (IDR)
  revenueIDR: number
  profitIDR: number
  marginPercent: number

  // Per Card (IDR)
  revenuePerCardIDR: number
  costPerCardIDR: number
  profitPerCardIDR: number
}

export function calculateBatchEstimate(input: BatchEstimateInput): BatchEstimate {
  const {
    cardsCount,
    deadlineDays,
    pricePerCardUSDT,
    useLocalGpu,
    gpuConfig,
    exchangeRateUSDTtoIDR,
  } = input

  // Step 1: Calculate required throughput
  const cardsPerDayRequired = Math.ceil(cardsCount / deadlineDays)

  // Step 2: Calculate local GPU capacity (cards per day)
  const minutesPerDay = 24 * 60
  const localGpuCardsPerDay = useLocalGpu && gpuConfig.local.enabled
    ? Math.floor(minutesPerDay / gpuConfig.local.renderTimeMinutes)
    : 0

  // Step 3: Calculate cloud GPU needs
  const cloudCardsPerDayNeeded = Math.max(0, cardsPerDayRequired - localGpuCardsPerDay)
  const cloudGpuCardsPerDay = Math.floor(minutesPerDay / gpuConfig.cloud.renderTimeMinutes)
  const cloudGpusRequired = cloudCardsPerDayNeeded > 0
    ? Math.ceil(cloudCardsPerDayNeeded / cloudGpuCardsPerDay)
    : 0

  // Step 4: Calculate hours
  const totalCloudHours = cloudGpusRequired * deadlineDays * 24
  const totalLocalHours = useLocalGpu && gpuConfig.local.enabled
    ? deadlineDays * 24
    : 0

  // Step 5: Calculate costs (IDR)
  const cloudCostUSD = new Decimal(totalCloudHours)
    .times(gpuConfig.cloud.costPerHourUSD)
  const cloudCostIDR = cloudCostUSD
    .times(exchangeRateUSDTtoIDR)
    .round()
    .toNumber()

  const electricityKWh = new Decimal(totalLocalHours)
    .times(gpuConfig.local.powerDrawWatts)
    .dividedBy(1000)
  const electricityCostIDR = electricityKWh
    .times(gpuConfig.electricityRateIDR)
    .round()
    .toNumber()

  const totalCostIDR = cloudCostIDR + electricityCostIDR

  // Step 6: Calculate revenue (IDR)
  const revenueUSDT = new Decimal(cardsCount).times(pricePerCardUSDT)
  const revenueIDR = revenueUSDT
    .times(exchangeRateUSDTtoIDR)
    .round()
    .toNumber()

  // Step 7: Calculate profit
  const profitIDR = revenueIDR - totalCostIDR
  const marginPercent = revenueIDR > 0
    ? new Decimal(profitIDR).dividedBy(revenueIDR).times(100).toNumber()
    : 0

  // Step 8: Feasibility check
  const totalCapacityPerDay = localGpuCardsPerDay + (cloudGpusRequired * cloudGpuCardsPerDay)
  const isFeasible = totalCapacityPerDay >= cardsPerDayRequired

  let feasibilityNote: string
  if (isFeasible) {
    if (cloudGpusRequired === 0) {
      feasibilityNote = 'Can complete with local GPU only'
    } else {
      feasibilityNote = `Need ${cloudGpusRequired} cloud GPU${cloudGpusRequired > 1 ? 's' : ''}`
    }
  } else {
    feasibilityNote = 'Need more GPUs or longer deadline'
  }

  return {
    isFeasible,
    feasibilityNote,
    cardsPerDayRequired,
    localGpuCardsPerDay,
    cloudCardsPerDayNeeded,
    cloudGpusRequired,
    totalCloudHours,
    totalLocalHours,
    cloudCostIDR,
    electricityCostIDR,
    totalCostIDR,
    revenueIDR,
    profitIDR,
    marginPercent: Math.round(marginPercent * 10) / 10,
    revenuePerCardIDR: Math.round(revenueIDR / cardsCount),
    costPerCardIDR: Math.round(totalCostIDR / cardsCount),
    profitPerCardIDR: Math.round(profitIDR / cardsCount),
  }
}
```

---

## API Endpoints

### Batch Endpoints (New)

```typescript
// Backend routes

POST   /api/batch                    // Create new batch
GET    /api/batch/project/:projectId // Get all batches for project
GET    /api/batch/:id                // Get single batch with expenses
PATCH  /api/batch/:id                // Update batch (status, notes)
DELETE /api/batch/:id                // Delete batch

// Request: POST /api/batch
interface CreateBatchDto {
  projectId: string
  cardsCount: number
  deadlineAt: string  // ISO date
  useLocalGpu: boolean
  cloudGpusPlanned: number
  cloudHoursPlanned: number
  exchangeRateUsed: number
  projectedCloudCostIDR: number
  projectedElectricityCostIDR: number
  projectedTotalCostIDR: number
  projectedRevenueIDR: number
  projectedProfitIDR: number
  projectedMarginPercent: number
  projectedCostPerCardIDR: number
  projectedProfitPerCardIDR: number
  notes?: string
}

// Response includes auto-generated batchNumber
```

### Project Endpoint Update

```typescript
// Update existing endpoint
PATCH  /api/project/:id

// Add to UpdateProjectDto
interface UpdateProjectDto {
  title?: string
  goalTotal?: number
  pricePerCardUSDT?: string  // NEW (as string for Decimal)
}
```

### Expense Endpoint Update

```typescript
// Update existing endpoint
POST   /api/expense
PATCH  /api/expense/:id

// Add to DTOs
interface CreateExpenseDto {
  // ... existing fields
  batchId?: string  // NEW: optional batch link
}
```

---

## UI Components

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `GpuSettingsModal` | `components/settings/GpuSettingsModal.tsx` | Configure GPU specs |
| `NewBatchModal` | `components/batch/NewBatchModal.tsx` | Batch estimator (critical) |
| `BatchList` | `components/batch/BatchList.tsx` | List all batches for project |
| `BatchCard` | `components/batch/BatchCard.tsx` | Single batch summary |
| `BatchDetailModal` | `components/batch/BatchDetailModal.tsx` | Detailed batch view |
| `ContractSummary` | `components/project/ContractSummary.tsx` | Project profit dashboard |

### Modified Components

| Component | Changes |
|-----------|---------|
| `ProjectCard` | Add contract value display, "Batches" button |
| `AddProjectModal` | Add pricePerCardUSDT field |
| `EditProjectModal` | Add pricePerCardUSDT field |
| `AddExpenseModal` | Add batch selector dropdown |
| `Sidebar` | Add GPU Settings link (optional) |

---

## Component Specifications

### NewBatchModal (Critical Component)

```tsx
// components/batch/NewBatchModal.tsx

interface NewBatchModalProps {
  isOpen: boolean
  onClose: () => void
  project: CardProject
}

// Layout Structure:
// ┌─────────────────────────────────────────────────────────┐
// │ NEW BATCH ESTIMATION                                    │
// ├─────────────────────────────────────────────────────────┤
// │ INPUTS                                                  │
// │   Cards: [____]  Deadline: [__] days  Local GPU: [✓]   │
// ├─────────────────────────────────────────────────────────┤
// │ GPU PLANNING                                            │
// │   Throughput needed: X cards/day                        │
// │   Local capacity: Y cards/day                           │
// │   Cloud needed: Z GPUs                                  │
// ├─────────────────────────────────────────────────────────┤
// │ PROJECTED COSTS (IDR)                                   │
// │   Cloud:       Rp XXX                                   │
// │   Electricity: Rp XXX                                   │
// │   Total:       Rp XXX                                   │
// ├─────────────────────────────────────────────────────────┤
// │ PROFITABILITY                                           │
// │   Revenue: Rp XXX                                       │
// │   Profit:  Rp XXX (XX%)                                │
// │   Per card: Rp XXX profit                              │
// ├─────────────────────────────────────────────────────────┤
// │                           [Cancel] [Create Batch]       │
// └─────────────────────────────────────────────────────────┘

export default function NewBatchModal({ isOpen, onClose, project }: NewBatchModalProps) {
  const { gpuConfig, exchangeRate, addBatch } = useStore()

  // Form state
  const [cardsCount, setCardsCount] = useState(0)
  const [deadlineDays, setDeadlineDays] = useState(1)
  const [useLocalGpu, setUseLocalGpu] = useState(gpuConfig.local.enabled)

  // Calculate estimate on input change
  const estimate = useMemo(() => {
    if (cardsCount <= 0 || deadlineDays <= 0) return null

    return calculateBatchEstimate({
      cardsCount,
      deadlineDays,
      pricePerCardUSDT: Number(project.pricePerCardUSDT),
      useLocalGpu,
      gpuConfig,
      exchangeRateUSDTtoIDR: Number(exchangeRate),
    })
  }, [cardsCount, deadlineDays, useLocalGpu, gpuConfig, exchangeRate, project])

  // ... render UI
}
```

### BatchCard Component

```tsx
// components/batch/BatchCard.tsx

interface BatchCardProps {
  batch: RenderingBatch
  actualCost: number  // Calculated from linked expenses
}

// Layout:
// ┌─────────────────────────────────────────────────────────┐
// │ #1 │ 2,300 cards │ Jan 4 │ ✓ Completed                 │
// │    │ Projected: Rp 600k │ Actual: Rp 574k │ Saved: 26k │
// └─────────────────────────────────────────────────────────┘
```

### ContractSummary Component

```tsx
// components/project/ContractSummary.tsx

interface ContractSummaryProps {
  project: CardProject
  batches: RenderingBatch[]
}

// Shows:
// - Contract value (IDR)
// - Progress bar (cards delivered / total)
// - Payment status (received vs pending)
// - Cost status (projected vs actual)
// - Profit projection
```

---

## Implementation Phases

### Phase 1: Core Batch Estimator
**Goal:** Solve "new batch decision making" pain point

**Tasks:**
1. Add `pricePerCardUSDT` field to CardProject model
2. Create database migration
3. Create `GpuConfigSlice` in Zustand
4. Create `batchCalculator.ts` service
5. Build `GpuSettingsModal` component
6. Build `NewBatchModal` component
7. Update `AddProjectModal` with price field
8. Update `EditProjectModal` with price field

**Deliverable:** User can estimate any batch in 30 seconds

### Phase 2: Batch Persistence & Tracking
**Goal:** Save batches and track progress

**Tasks:**
1. Create `RenderingBatch` model and migration
2. Create batch API endpoints (CRUD)
3. Create `BatchSlice` in Zustand
4. Create `batch.service.ts` for API calls
5. Build `BatchList` component
6. Build `BatchCard` component
7. Add "Batches" button to `ProjectCard`

**Deliverable:** User can create, view, and manage batches

### Phase 3: Cost Tracking
**Goal:** Compare projected vs actual costs

**Tasks:**
1. Add `batchId` field to Expense model
2. Update expense API endpoints
3. Update `AddExpenseModal` with batch selector
4. Build `BatchDetailModal` with expense list
5. Calculate actual costs from linked expenses
6. Show projected vs actual comparison

**Deliverable:** User can track actual costs per batch

### Phase 4: Contract Dashboard
**Goal:** Overall contract health visibility

**Tasks:**
1. Build `ContractSummary` component
2. Aggregate batch data for totals
3. Calculate profit projection
4. Integrate into ProjectCard or ProjectDetails
5. Add payment tracking display (from Income)

**Deliverable:** User can see full contract status at a glance

---

## File Structure

```
frontend/src/
├── components/
│   ├── batch/                    # NEW
│   │   ├── NewBatchModal.tsx     # Critical estimator
│   │   ├── BatchList.tsx
│   │   ├── BatchCard.tsx
│   │   └── BatchDetailModal.tsx
│   ├── project/
│   │   ├── ProjectCard.tsx       # MODIFY
│   │   ├── ProjectDashboard.tsx  # MODIFY (minor)
│   │   ├── AddProjectModal.tsx   # MODIFY
│   │   ├── EditProjectModal.tsx  # MODIFY
│   │   └── ContractSummary.tsx   # NEW
│   ├── expense/
│   │   └── AddExpenseModal.tsx   # MODIFY
│   └── settings/
│       └── GpuSettingsModal.tsx  # NEW
├── services/
│   ├── batchCalculator.ts        # NEW
│   └── batch.service.ts          # NEW
├── store/
│   ├── slices/
│   │   ├── gpuConfig.slice.ts    # NEW
│   │   └── batch.slice.ts        # NEW
│   └── store.ts                  # MODIFY

backend/
├── prisma/
│   └── schema.prisma             # MODIFY
├── src/
│   └── batch/                    # NEW module
│       ├── batch.controller.ts
│       ├── batch.service.ts
│       ├── batch.module.ts
│       └── dto/
│           ├── create-batch.dto.ts
│           └── update-batch.dto.ts

shared/src/
├── types/
│   └── batch.types.ts            # NEW
└── enums/
    └── batch.enum.ts             # NEW (BatchStatus)
```

---

## Key Formulas Reference

```
# GPU Capacity
cards_per_day = (24 * 60) / render_time_minutes

# Cloud GPUs Needed
cloud_needed = ceil((required_per_day - local_capacity) / cloud_capacity_per_gpu)

# Costs (IDR)
cloud_cost = cloud_gpus × deadline_days × 24 × cost_per_hour_usd × exchange_rate
electricity = deadline_days × 24 × (watts / 1000) × rate_per_kwh

# Revenue & Profit (IDR)
revenue = cards × price_usdt × exchange_rate
profit = revenue - total_cost
margin = (profit / revenue) × 100
```

---

## Example Calculation

**Input:**
- Cards: 2,300
- Deadline: 2 days
- Price: 0.13 USDT
- Exchange rate: Rp 16,691
- Local GPU: RTX 3060 Ti (14 min/card, 300W)
- Cloud GPU: RTX 5090 (2.5 min/card, $0.36/hr)
- Electricity: Rp 1,600/kWh

**GPU Planning:**
```
Required: 2,300 / 2 = 1,150 cards/day
Local capacity: 1,440 / 14 = 102.8 ≈ 103 cards/day
Cloud needed: 1,150 - 103 = 1,047 cards/day
Cloud GPU capacity: 1,440 / 2.5 = 576 cards/day/GPU
Cloud GPUs required: ceil(1,047 / 576) = 2 GPUs
```

**Costs (IDR):**
```
Cloud hours: 2 GPUs × 2 days × 24h = 96 hours
Cloud cost: 96 × $0.36 × 16,691 = Rp 576,953

Electricity: 2 days × 24h × 0.3kW × 1,600 = Rp 23,040

Total cost: Rp 599,993
```

**Profitability (IDR):**
```
Revenue: 2,300 × 0.13 × 16,691 = Rp 4,990,609
Profit: Rp 4,990,609 - Rp 599,993 = Rp 4,390,616
Margin: 88.0%

Per card:
  Revenue: Rp 2,170
  Cost: Rp 261
  Profit: Rp 1,909
```

---

## Success Criteria

1. User can estimate a new batch in under 30 seconds
2. Estimation shows GPU count, costs, and profit in IDR
3. Batches are persisted and trackable
4. Actual costs can be compared to projections
5. Contract-level profitability is visible
6. All monetary values displayed in IDR

---

## Dependencies

- Existing: CardProject, Expense, Currency service, Exchange rate
- External: Vast.ai pricing (manual input), PLN electricity rate

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Exchange rate fluctuation | Snapshot rate at batch creation |
| GPU pricing changes | User can update in settings anytime |
| Calculation errors | Use Decimal.js for all math |
| Stale projections | Show "projected at Rp X rate" label |

---

## Future Enhancements (Out of Scope)

- Multiple cloud GPU types
- Automatic Vast.ai price fetching
- Batch templates for common sizes
- Export reports (PDF/Excel)
- Mobile responsive optimization
- Notification on deadline approaching
