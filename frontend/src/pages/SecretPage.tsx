import { useMemo } from 'react'
import { useStore } from '@/store/store'
import { formatIDR } from '@/services/batchCalculator'

// Hardcoded total projected profit
const TOTAL_PROJECTED_PROFIT_IDR = 69_510_600

// Dividend receivers and their shares
const RECEIVERS = [
  { name: 'Kid', sharePercent: 10 },
  { name: 'Hashi', sharePercent: 5 },
  // Remaining 85% split equally between these three
  { name: 'Jeff', sharePercent: 85 / 3 },
  { name: 'Kelby', sharePercent: 85 / 3 },
  { name: 'Julius', sharePercent: 85 / 3 },
]

export default function SecretPage() {
  const { expenses } = useStore()

  // Calculate total expenses from database
  const totalExpensesIDR = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const amount = parseFloat(String(expense.amountIDR || 0))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }, [expenses])

  // Calculate true profit
  const trueProfitIDR = TOTAL_PROJECTED_PROFIT_IDR - totalExpensesIDR

  // Calculate dividend for each receiver
  const dividends = useMemo(() => {
    return RECEIVERS.map((receiver) => ({
      ...receiver,
      amount: (trueProfitIDR * receiver.sharePercent) / 100,
    }))
  }, [trueProfitIDR])

  return (
    <div className="min-h-screen bg-bg-primary p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Dividend Distribution
        </h1>
        <p className="text-text-secondary mb-8">Profit sharing calculation</p>

        {/* Profit Calculation */}
        <div className="bg-bg-secondary rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Profit Calculation
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Projected Profit</span>
              <span className="font-medium text-text-primary">
                {formatIDR(TOTAL_PROJECTED_PROFIT_IDR)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Expenses</span>
              <span className="font-medium text-error">
                - {formatIDR(totalExpensesIDR)}
              </span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-text-primary">True Profit</span>
              <span className={`font-bold text-xl ${trueProfitIDR >= 0 ? 'text-success' : 'text-error'}`}>
                {formatIDR(trueProfitIDR)}
              </span>
            </div>
          </div>
        </div>

        {/* Dividend Distribution */}
        <div className="bg-bg-secondary rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Share Distribution
          </h2>
          <div className="space-y-4">
            {dividends.map((receiver) => (
              <div
                key={receiver.name}
                className="flex items-center justify-between p-4 bg-bg-tertiary rounded-lg"
              >
                <div>
                  <p className="font-medium text-text-primary">{receiver.name}</p>
                  <p className="text-sm text-text-secondary">
                    {receiver.sharePercent.toFixed(2)}% share
                  </p>
                </div>
                <p className={`text-lg font-bold ${receiver.amount >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatIDR(receiver.amount)}
                </p>
              </div>
            ))}
          </div>

          {/* Verification */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Total Distributed</span>
              <span>
                {formatIDR(dividends.reduce((sum, d) => sum + d.amount, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-tertiary mt-8">
          This page is confidential
        </p>
      </div>
    </div>
  )
}
