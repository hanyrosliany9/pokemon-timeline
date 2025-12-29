import { useMemo, useState } from 'react'
import { Income } from '@pokemon-timeline/shared'
import { useStore } from '@/store/store'
import IncomeCard from './IncomeCard'
import UpdateIncomeModal from './UpdateIncomeModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface IncomeListProps {
  income: Income[]
}

export default function IncomeList({ income }: IncomeListProps) {
  const { preferredCurrency, searchQuery } = useStore()
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Filter income based on search query
  const filteredIncome = useMemo(() => {
    return income.filter((inc) => {
      // Search query filter (search in description and notes)
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesDescription = inc.description.toLowerCase().includes(searchLower)
        const matchesNotes = inc.notes?.toLowerCase().includes(searchLower) ?? false
        if (!matchesDescription && !matchesNotes) {
          return false
        }
      }

      return true
    })
  }, [income, searchQuery])

  // Sort filtered income
  const sortedIncome = useMemo(() => {
    return [...filteredIncome].sort((a, b) => {
      if (sortBy === 'amount') {
        const amountA =
          preferredCurrency === 'USDT' ? parseFloat(a.amountUSDT.toString()) : parseFloat(a.amountIDR.toString())
        const amountB =
          preferredCurrency === 'USDT' ? parseFloat(b.amountUSDT.toString()) : parseFloat(b.amountIDR.toString())
        return amountB - amountA
      }
      return new Date(b.incomeDate).getTime() - new Date(a.incomeDate).getTime()
    })
  }, [filteredIncome, sortBy, preferredCurrency])

  const handleEdit = (incomeItem: Income) => {
    setSelectedIncome(incomeItem)
    setIsEditOpen(true)
  }

  return (
    <>
      <div className="bg-bg-secondary rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">
            Recent Income {filteredIncome.length !== income.length && `(${filteredIncome.length}/${income.length})`}
          </h3>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'amount')}>
            <SelectTrigger className="w-40 border-border text-text-primary">
              <SelectValue className="text-text-primary" />
            </SelectTrigger>
            <SelectContent className="bg-bg-secondary border-border">
              <SelectItem value="date" className="text-text-primary">Sort by Date</SelectItem>
              <SelectItem value="amount" className="text-text-primary">Sort by Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {sortedIncome.length === 0 ? (
            <div className="p-12 text-center bg-bg-primary rounded-lg border-2 border-dashed border-border">
              <p className="text-text-primary font-medium">
                {income.length === 0 ? 'No income yet. Add one to get started!' : 'No income matches your filters.'}
              </p>
            </div>
          ) : (
            sortedIncome.map((incomeItem) => (
              <IncomeCard key={incomeItem.id} income={incomeItem} onEdit={handleEdit} />
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedIncome && (
        <UpdateIncomeModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setSelectedIncome(null)
          }}
          income={selectedIncome}
        />
      )}
    </>
  )
}
