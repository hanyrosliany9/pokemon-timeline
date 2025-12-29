import { StateCreator } from 'zustand'
import { ExpenseCategory, Currency } from '@pokemon-timeline/shared'

export interface DateRange {
  start: string | null
  end: string | null
}

export interface FilterState {
  // Filters
  categoryFilter: ExpenseCategory | 'ALL'
  currencyFilter: Currency | 'ALL'
  dateRangeFilter: DateRange
  searchQuery: string
  minAmount: number | null
  maxAmount: number | null

  // Filter actions
  setCategoryFilter: (category: ExpenseCategory | 'ALL') => void
  setCurrencyFilter: (currency: Currency | 'ALL') => void
  setDateRangeFilter: (range: DateRange) => void
  setSearchQuery: (query: string) => void
  setAmountRange: (min: number | null, max: number | null) => void

  // Utility actions
  hasActiveFilters: () => boolean
  resetFilters: () => void
}

export const createFilterSlice: StateCreator<FilterState> = (set, get) => ({
  // Initial state
  categoryFilter: 'ALL',
  currencyFilter: 'ALL',
  dateRangeFilter: { start: null, end: null },
  searchQuery: '',
  minAmount: null,
  maxAmount: null,

  // Category filter
  setCategoryFilter: (category: ExpenseCategory | 'ALL') => {
    set({ categoryFilter: category })
  },

  // Currency filter
  setCurrencyFilter: (currency: Currency | 'ALL') => {
    set({ currencyFilter: currency })
  },

  // Date range filter
  setDateRangeFilter: (range: DateRange) => {
    set({ dateRangeFilter: range })
  },

  // Search query filter
  setSearchQuery: (query: string) => {
    set({ searchQuery: query.toLowerCase().trim() })
  },

  // Amount range filter
  setAmountRange: (min: number | null, max: number | null) => {
    set({ minAmount: min, maxAmount: max })
  },

  // Check if any filters are active
  hasActiveFilters: () => {
    const state = get()
    return (
      state.categoryFilter !== 'ALL' ||
      state.currencyFilter !== 'ALL' ||
      state.searchQuery !== '' ||
      state.minAmount !== null ||
      state.maxAmount !== null ||
      state.dateRangeFilter.start !== null ||
      state.dateRangeFilter.end !== null
    )
  },

  // Reset all filters
  resetFilters: () => {
    set({
      categoryFilter: 'ALL',
      currencyFilter: 'ALL',
      dateRangeFilter: { start: null, end: null },
      searchQuery: '',
      minAmount: null,
      maxAmount: null,
    })
  },
})
