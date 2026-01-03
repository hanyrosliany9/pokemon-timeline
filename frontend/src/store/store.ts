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
import { GpuConfigSlice, createGpuConfigSlice } from './slices/gpuConfig.slice'
import { BatchSlice, createBatchSlice } from './slices/batch.slice'

export type Store = ProjectSlice & EntrySlice & CategorySlice & ExpenseSlice & CurrencySlice & UISlice & ThemeSlice & FilterState & GpuConfigSlice & BatchSlice

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
        ...createGpuConfigSlice(...a),
        ...createBatchSlice(...a),
      }),
      {
        name: 'pokemon-timeline-store',
        partialize: (state) => ({
          preferredCurrency: state.preferredCurrency,
          theme: state.theme,
          expenses: state.expenses,
          income: state.income,
          gpuConfig: state.gpuConfig,
        }),
        // Merge persisted state with defaults to handle schema changes
        merge: (persistedState, currentState) => {
          const persisted = persistedState as Partial<Store> | undefined
          return {
            ...currentState,
            ...persisted,
            // Ensure arrays are always arrays (fixes corrupted localStorage)
            expenses: Array.isArray(persisted?.expenses) ? persisted.expenses : [],
            income: Array.isArray(persisted?.income) ? persisted.income : [],
            // Ensure gpuConfig has proper structure
            gpuConfig: {
              localGpus: Array.isArray(persisted?.gpuConfig?.localGpus)
                ? persisted.gpuConfig.localGpus
                : currentState.gpuConfig.localGpus,
              cloudGpus: Array.isArray(persisted?.gpuConfig?.cloudGpus)
                ? persisted.gpuConfig.cloudGpus
                : currentState.gpuConfig.cloudGpus,
              electricityRateIDR: persisted?.gpuConfig?.electricityRateIDR ?? currentState.gpuConfig.electricityRateIDR,
            },
          }
        },
      },
    ),
  ),
)
