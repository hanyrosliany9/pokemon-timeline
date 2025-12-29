import { useStore } from '@/store/store'
import { TrendingUp } from 'lucide-react'

interface WalletBalanceProps {
  currency: 'USDT' | 'IDR'
}

export default function WalletBalance({ currency }: WalletBalanceProps) {
  const { getNetBalanceUSDT, getNetBalanceIDR, getIncomeUSDT, getIncomeIDR, getTotalUSDT, getTotalIDR } = useStore()

  const balance = currency === 'USDT' ? getNetBalanceUSDT() : getNetBalanceIDR()
  const income = currency === 'USDT' ? getIncomeUSDT() : getIncomeIDR()
  const expenses = currency === 'USDT' ? getTotalUSDT() : getTotalIDR()
  const symbol = currency === 'USDT' ? '$' : 'Rp'
  const color = currency === 'USDT' ? 'text-yellow-500' : 'text-green-500'
  const balanceNum = parseFloat(balance)

  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${color}`}>{currency} Wallet</h3>
        <TrendingUp className={`w-5 h-5 ${color}`} />
      </div>

      {/* Net Balance */}
      <div className="mb-6">
        <p className="text-sm text-text-secondary mb-1">Net Balance</p>
        <p className={`text-4xl font-bold tabular-nums ${balanceNum < 0 ? 'text-red-600' : color}`}>
          {symbol} {Math.abs(balanceNum).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Income and Expenses Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-text-secondary mb-1">Income</p>
          <p className="text-lg font-semibold text-green-600 tabular-nums">
            {symbol} {parseFloat(income).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-secondary mb-1">Expenses</p>
          <p className="text-lg font-semibold text-red-600 tabular-nums">
            {symbol} {parseFloat(expenses).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
