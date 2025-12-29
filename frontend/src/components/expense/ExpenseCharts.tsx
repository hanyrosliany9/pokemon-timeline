import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useStore } from '@/store/store'
import { rawColors } from '@/styles/design-tokens'

// Currency formatter helper
const formatCurrencyValue = (value: number, currency: string): string => {
  if (currency === 'IDR') {
    return `IDR ${(value as number).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  return `$${(value as number).toFixed(2)}`
}

// Get chart color from design tokens
const getChartLineColor = (isDark: boolean) => {
  return isDark ? rawColors.dark.chart[0] : rawColors.light.chart[0]
}

export default function ExpenseCharts() {
  const { expenses, preferredCurrency, categories, theme } = useStore()
  const isDark = theme === 'dark'
  const lineColor = getChartLineColor(isDark)

  // Currency formatter with access to preferredCurrency
  const tooltipFormatter = (value: number) => {
    return formatCurrencyValue(value, preferredCurrency)
  }

  // Create a map of category IDs to Category objects for quick lookup
  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.id, cat]))
  }, [categories])

  // Data for bar chart - Expenses by category
  const categoryData = useMemo(() => {
    const grouped = expenses.reduce(
      (acc, expense) => {
        const category = categoryMap.get(expense.categoryId)
        if (!category) return acc

        // Use the pre-calculated USDT and IDR amounts from the expense
        const amount =
          preferredCurrency === 'USDT'
            ? parseFloat(String(expense.amountUSDT))
            : parseFloat(String(expense.amountIDR))

        const existing = acc.find((item) => item.categoryId === category.id)
        if (existing) {
          existing.amount += amount
        } else {
          acc.push({
            name: category.label,
            amount,
            categoryId: category.id,
            fill: category.color,
          })
        }
        return acc
      },
      [] as Array<{ name: string; amount: number; categoryId: string; fill: string }>,
    )
    return grouped.sort((a, b) => b.amount - a.amount)
  }, [expenses, preferredCurrency, categoryMap])

  // Data for pie chart - Category distribution
  const pieData = useMemo(() => {
    return categoryData.map((item) => ({
      name: item.name,
      value: item.amount,
      categoryId: item.categoryId,
      fill: item.fill,
    }))
  }, [categoryData])

  // Data for line chart - Monthly trend
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, number>()

    expenses.forEach((expense) => {
      const date = new Date(expense.expenseDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const amount =
        preferredCurrency === 'USDT'
          ? parseFloat(String(expense.amountUSDT))
          : parseFloat(String(expense.amountIDR))

      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount)
    })

    return Array.from(monthlyMap.entries())
      .sort()
      .map(([month, total]) => ({
        month: month,
        amount: total,
      }))
  }, [expenses, preferredCurrency])

  if (expenses.length === 0) {
    return (
      <div className="p-12 text-center bg-bg-tertiary rounded-lg border-2 border-dashed border-border">
        <h3 className="text-lg font-semibold text-text-primary mb-2">No Data</h3>
        <p className="text-text-secondary">Add expenses to see visualization charts</p>
        <p className="text-text-tertiary text-sm mt-2">Charts will appear once you create expenses.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Bar Chart - Expenses by Category */}
      <div className="md:col-span-2 bg-bg-secondary rounded-lg border border-border p-6">
        <div className="mb-4">
          <h4 className="text-base font-semibold text-text-primary">Expenses by Category</h4>
          <p className="text-sm text-text-secondary mt-1">Distribution of expenses across categories (in {preferredCurrency})</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={tooltipFormatter} />
            <Bar dataKey="amount">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${entry.categoryId}-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Category Distribution */}
      <div className="bg-bg-secondary rounded-lg border border-border p-6">
        <div className="mb-4">
          <h4 className="text-base font-semibold text-text-primary">Distribution</h4>
          <p className="text-sm text-text-secondary mt-1">Percentage breakdown by category</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${entry.categoryId}-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Monthly Trend */}
      {monthlyData.length > 0 && (
        <div className="md:col-span-2 lg:col-span-3 bg-bg-secondary rounded-lg border border-border p-6">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-text-primary">Monthly Trend</h4>
            <p className="text-sm text-text-secondary mt-1">Expense amount over time (in {preferredCurrency})</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={lineColor}
                dot={{ fill: lineColor, r: 4 }}
                activeDot={{ r: 6 }}
                name="Monthly Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
