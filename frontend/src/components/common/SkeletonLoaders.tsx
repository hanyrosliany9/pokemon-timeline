import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * ★ Insight ─────────────────────────────────────
 * Skeleton loaders provide visual feedback while
 * data is loading. They use gradient animations to
 * indicate activity without blocking user interaction.
 * Improves perceived performance and UX.
 * ─────────────────────────────────────────────────
 */

/**
 * Skeleton for timeline event cards
 */
export function TimelineEventSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <Skeleton className="w-8 h-8 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for expense cards
 */
export function ExpenseCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="flex-shrink-0 text-right space-y-2">
            <Skeleton className="h-6 w-20 ml-auto" />
            <Skeleton className="h-8 w-8 ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for progress stats cards
 */
export function ProgressStatsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 border rounded-lg space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

/**
 * Skeleton for list of items (generic)
 */
export function ListItemsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-5 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Skeleton for header/dashboard
 */
export function HeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/4" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <Skeleton className="h-6 w-1/2" />
    </div>
  )
}

/**
 * Skeleton for wallet balance cards
 */
export function WalletBalanceSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-6 w-12" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-8 w-1/2" />
        </div>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for form fields
 */
export function FormFieldSkeleton({ fieldCount = 4 }: { fieldCount?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(fieldCount)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 justify-end pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/**
 * Skeleton for chart/analytics
 */
export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
