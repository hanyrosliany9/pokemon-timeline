import { useStore } from '@/store/store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'

export default function ExpenseFilters() {
  const {
    categories,
    categoryFilter,
    currencyFilter,
    dateRangeFilter,
    searchQuery,
    minAmount,
    maxAmount,
    setCategoryFilter,
    setCurrencyFilter,
    setDateRangeFilter,
    setSearchQuery,
    setAmountRange,
    hasActiveFilters,
    resetFilters,
  } = useStore()

  return (
    <div className="bg-bg-secondary rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Filter & Search</h3>
        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="gap-2 border-border text-text-secondary hover:bg-bg-primary"
          >
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>
      <div>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium text-text-primary">Search Description</Label>
            <Input
              id="search"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border placeholder:text-text-secondary"
            />
          </div>

          {/* Category & Currency Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-text-primary">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category" className="border-border text-text-primary">
                  <SelectValue className="text-text-primary" />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border">
                  <SelectItem value="ALL" className="text-text-primary">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-text-primary">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency Filter */}
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-text-primary">Currency</Label>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger id="currency" className="border-border text-text-primary">
                  <SelectValue className="text-text-primary" />
                </SelectTrigger>
                <SelectContent className="bg-bg-secondary border-border">
                  <SelectItem value="ALL" className="text-text-primary">All Currencies</SelectItem>
                  <SelectItem value="USDT" className="text-text-primary">USDT</SelectItem>
                  <SelectItem value="IDR" className="text-text-primary">IDR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-text-primary">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRangeFilter.start || ''}
                onChange={(e) =>
                  setDateRangeFilter({
                    ...dateRangeFilter,
                    start: e.target.value || null,
                  })
                }
                className="border-border text-text-primary placeholder:text-text-secondary"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-text-primary">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRangeFilter.end || ''}
                onChange={(e) =>
                  setDateRangeFilter({
                    ...dateRangeFilter,
                    end: e.target.value || null,
                  })
                }
                className="border-border text-text-primary placeholder:text-text-secondary"
              />
            </div>
          </div>

          {/* Amount Range Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Minimum Amount */}
            <div className="space-y-2">
              <Label htmlFor="minAmount" className="text-sm font-medium text-text-primary">Min Amount</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0"
                step="0.01"
                min="0"
                value={minAmount ?? ''}
                onChange={(e) =>
                  setAmountRange(
                    e.target.value ? parseFloat(e.target.value) : null,
                    maxAmount,
                  )
                }
                className="border-border text-text-primary placeholder:text-text-secondary"
              />
            </div>

            {/* Maximum Amount */}
            <div className="space-y-2">
              <Label htmlFor="maxAmount" className="text-sm font-medium text-text-primary">Max Amount</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="∞"
                step="0.01"
                min="0"
                value={maxAmount ?? ''}
                onChange={(e) =>
                  setAmountRange(
                    minAmount,
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className="border-border text-text-primary placeholder:text-text-secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
