import { useStore } from '@/store/store'

export default function ExpenseStats() {
  const {
    getTotalUSDT,
    getTotalIDR,
    getAverageUSDT,
    getAverageIDR,
    preferredCurrency,
  } = useStore()

  const totalUSDT = getTotalUSDT()
  const totalIDR = getTotalIDR()
  const avgUSDT = getAverageUSDT()
  const avgIDR = getAverageIDR()

  const StatCard = ({ label, value, currency }: { label: string; value: string; currency: string }) => (
    <div className="bg-bg-secondary rounded-xl p-6 border border-border">
      <p className="text-sm font-medium text-text-secondary mb-2">{label}</p>
      <div className="text-3xl font-bold text-text-primary tabular-nums">{value}</div>
      <p className="text-xs text-text-secondary mt-1">{currency}</p>
    </div>
  )

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <StatCard
        label="Total Expenses"
        value={`${preferredCurrency === 'USDT' ? '$' : 'Rp'}${preferredCurrency === 'USDT' ? parseFloat(totalUSDT).toLocaleString() : parseFloat(totalIDR).toLocaleString()}`}
        currency={preferredCurrency}
      />

      <StatCard
        label="Average Expense"
        value={`${preferredCurrency === 'USDT' ? '$' : 'Rp'}${preferredCurrency === 'USDT' ? parseFloat(avgUSDT).toLocaleString() : parseFloat(avgIDR).toLocaleString()}`}
        currency={preferredCurrency}
      />

      <StatCard
        label="Total in Alternate Currency"
        value={`${preferredCurrency === 'USDT' ? 'Rp' : '$'}${preferredCurrency === 'USDT' ? parseFloat(totalIDR).toLocaleString() : parseFloat(totalUSDT).toLocaleString()}`}
        currency={preferredCurrency === 'USDT' ? 'IDR' : 'USDT'}
      />
    </div>
  )
}
