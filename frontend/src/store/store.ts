import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { ProjectSlice, createProjectSlice } from './slices/project.slice'
import { EntrySlice, createEntrySlice } from './slices/entry.slice'
import { CategorySlice, createCategorySlice } from './slices/category.slice'
import { ExpenseSlice, createExpenseSlice } from './slices/expense.slice'
import { CurrencySlice, createCurrencySlice } from './slices/currency.slice'
import { UISlice, createUISlice } from './slices/ui.slice'
import { ThemeSlice, createThemeSlice } from './slices/theme.slice'
import { FilterState, createFilterSlice } from './slices/filter.slice'

export type Store = ProjectSlice & EntrySlice & CategorySlice & ExpenseSlice & CurrencySlice & UISlice & ThemeSlice & FilterState

export const useStore = create<Store>()(
  devtools(
    persist(
      (...a) => ({
        ...createProjectSlice(...a),
        ...createEntrySlice(...a),
        ...createCategorySlice(...a),
        ...createExpenseSlice(...a),
        ...createCurrencySlice(...a),
        ...createUISlice(...a),
        ...createThemeSlice(...a),
        ...createFilterSlice(...a),
      }),
      {
        name: 'pokemon-timeline-store',
        partialize: (state) => ({
          preferredCurrency: state.preferredCurrency,
          theme: state.theme,
          expenses: state.expenses,
          income: state.income,
        }),
      },
    ),
  ),
)
