import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

type ColorVariant = 'purple' | 'blue' | 'green' | 'red' | 'yellow'

interface StatCardProps {
  label: string
  value: string | number
  currency?: 'USDT' | 'IDR'
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
  icon?: LucideIcon
  colorVariant?: ColorVariant
}

const colorVariants: Record<ColorVariant, { bg: string; text: string }> = {
  purple: { bg: 'bg-crypto/10', text: 'text-crypto' },
  blue: { bg: 'bg-info/10', text: 'text-info' },
  green: { bg: 'bg-success/10', text: 'text-success' },
  red: { bg: 'bg-error/10', text: 'text-error' },
  yellow: { bg: 'bg-warning/10', text: 'text-warning' },
}

export function StatCard({
  label,
  value,
  currency,
  trend,
  icon: Icon,
  colorVariant = 'purple'
}: StatCardProps) {
  const colors = colorVariants[colorVariant]

  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-border hover:shadow-md transition-shadow dark:bg-bg-secondary">
      {/* Icon */}
      {Icon && (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      )}

      {/* Label */}
      <p className="text-sm text-text-secondary mb-1">{label}</p>

      {/* Value */}
      <p className="text-3xl font-bold text-text-primary mb-2">
        {currency === 'USDT' && '$'}
        {currency === 'IDR' && 'Rp '}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend.direction === 'up' ? (
            <>
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">{trend.value}</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-red-600 font-medium">{trend.value}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
