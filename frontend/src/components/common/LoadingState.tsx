import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
  type: 'card' | 'list' | 'stat' | 'chart'
  count?: number
}

export function LoadingState({ type, count = 3 }: LoadingStateProps) {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-ios-card" />
        ))}
      </div>
    )
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-ios-card" />
        ))}
      </div>
    )
  }

  if (type === 'chart') {
    return <Skeleton className="h-96 w-full rounded-ios-card" />
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-ios-card" />
        ))}
      </div>
    )
  }

  return null
}
