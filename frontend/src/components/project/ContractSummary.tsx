import { useMemo } from 'react'
import { useStore } from '@/store/store'
import { formatIDR } from '@/services/batchCalculator'
import { CardProject, BatchStatus } from '@pokemon-timeline/shared'
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Target,
  Package,
  CheckCircle2,
} from 'lucide-react'

interface ContractSummaryProps {
  project: CardProject
}

/**
 * ContractSummary Component
 * Shows full contract health: value, progress, payments, profitability
 */
export default function ContractSummary({ project }: ContractSummaryProps) {
  const { batches, expenses, income, exchangeRate } = useStore()
  const projectBatches = batches[project.id] || []
  const currentRate = parseFloat(exchangeRate || '16691')

  // Calculate contract value
  const pricePerCard = parseFloat(String(project.pricePerCardUSDT || '0'))
  const contractValueUSDT = pricePerCard * project.goalTotal
  const contractValueIDR = contractValueUSDT * currentRate

  // Calculate batch statistics
  const stats = useMemo(() => {
    const totalBatches = projectBatches.length
    const completedBatches = projectBatches.filter(
      (b) => b.status === BatchStatus.COMPLETED
    ).length
    const inProgressBatches = projectBatches.filter(
      (b) => b.status === BatchStatus.IN_PROGRESS
    ).length

    const totalCardsInBatches = projectBatches.reduce(
      (sum, b) => sum + b.cardsCount,
      0
    )

    const totalProjectedCostIDR = projectBatches.reduce(
      (sum, b) => sum + parseFloat(b.projectedTotalCostIDR || '0'),
      0
    )

    const totalProjectedRevenueIDR = projectBatches.reduce(
      (sum, b) => sum + parseFloat(b.projectedRevenueIDR || '0'),
      0
    )

    const totalProjectedProfitIDR = projectBatches.reduce(
      (sum, b) => sum + parseFloat(b.projectedProfitIDR || '0'),
      0
    )

    // Actual costs from linked expenses
    const batchIds = new Set(projectBatches.map((b) => b.id))
    const totalActualCostIDR = expenses
      .filter((e) => e.batchId && batchIds.has(e.batchId))
      .reduce((sum, e) => sum + parseFloat(String(e.amountIDR || '0')), 0)

    // Income received for this project
    const projectIncome = income.reduce(
      (sum, i) => sum + parseFloat(String(i.amountIDR || '0')),
      0
    )

    return {
      totalBatches,
      completedBatches,
      inProgressBatches,
      totalCardsInBatches,
      totalProjectedCostIDR,
      totalActualCostIDR,
      totalProjectedRevenueIDR,
      totalProjectedProfitIDR,
      projectIncome,
    }
  }, [projectBatches, expenses, income])

  // Progress percentage
  const cardsProgress = project.goalTotal > 0
    ? Math.round((stats.totalCardsInBatches / project.goalTotal) * 100)
    : 0

  // Payment status (assuming 50/50 split)
  const expectedPayment = contractValueIDR / 2 // 50% downpayment expected
  const paymentReceived = stats.projectIncome
  const paymentStatus = paymentReceived >= contractValueIDR
    ? 'Fully Paid'
    : paymentReceived >= expectedPayment
    ? 'Downpayment Received'
    : 'Awaiting Payment'

  if (pricePerCard <= 0) {
    return (
      <div className="p-4 bg-bg-secondary rounded-lg border border-border text-center">
        <p className="text-text-secondary">
          Set a price per card in project settings to see contract summary
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Contract Value Card */}
      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Contract Value
          </h4>
          <span className="text-xs text-text-secondary">
            {project.goalTotal.toLocaleString()} cards @ {pricePerCard} USDT
          </span>
        </div>
        <p className="text-2xl font-bold">{formatIDR(contractValueIDR)}</p>
        <p className="text-sm text-text-secondary">
          ${contractValueUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
        </p>
      </div>

      {/* Progress & Batches */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <Target className="h-4 w-4" />
            Progress
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{cardsProgress}%</span>
            <span className="text-xs text-text-secondary mb-1">
              {stats.totalCardsInBatches.toLocaleString()} / {project.goalTotal.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-2 bg-bg-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-interactive transition-all duration-300"
              style={{ width: `${Math.min(100, cardsProgress)}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
            <Package className="h-4 w-4" />
            Batches
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{stats.totalBatches}</span>
            <span className="text-xs text-text-secondary mb-1">
              {stats.completedBatches} completed
            </span>
          </div>
          {stats.inProgressBatches > 0 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              {stats.inProgressBatches} in progress
            </p>
          )}
        </div>
      </div>

      {/* Payment Status */}
      <div className="p-4 bg-bg-secondary rounded-lg border border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            paymentStatus === 'Fully Paid'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : paymentStatus === 'Downpayment Received'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {paymentStatus}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-secondary">Received</p>
            <p className="font-medium text-income">{formatIDR(paymentReceived)}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">Expected (50%)</p>
            <p className="font-medium">{formatIDR(expectedPayment)}</p>
          </div>
        </div>
        <div className="mt-2 h-2 bg-bg-primary rounded-full overflow-hidden">
          <div
            className="h-full bg-income transition-all duration-300"
            style={{ width: `${Math.min(100, (paymentReceived / contractValueIDR) * 100)}%` }}
          />
        </div>
      </div>

      {/* Profitability Summary */}
      {stats.totalBatches > 0 && (
        <div className="p-4 bg-bg-secondary rounded-lg border border-border">
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4" />
            Profitability (Batches)
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-text-secondary">Projected Cost</p>
              <p className="font-medium">{formatIDR(stats.totalProjectedCostIDR)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Actual Cost</p>
              <p className="font-medium">
                {stats.totalActualCostIDR > 0
                  ? formatIDR(stats.totalActualCostIDR)
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Projected Profit</p>
              <p className={`font-medium ${stats.totalProjectedProfitIDR >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatIDR(stats.totalProjectedProfitIDR)}
              </p>
            </div>
          </div>

          {/* Variance Alert */}
          {stats.totalActualCostIDR > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              {(() => {
                const variance = stats.totalProjectedCostIDR - stats.totalActualCostIDR
                const variancePercent = stats.totalProjectedCostIDR > 0
                  ? (variance / stats.totalProjectedCostIDR) * 100
                  : 0
                return (
                  <div className={`flex items-center gap-2 text-sm ${
                    variance >= 0 ? 'text-income' : 'text-expense'
                  }`}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {variance >= 0 ? 'Under budget' : 'Over budget'} by{' '}
                      {formatIDR(Math.abs(variance))} ({Math.abs(variancePercent).toFixed(1)}%)
                    </span>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
