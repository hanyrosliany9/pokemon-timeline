import { useEffect, useRef } from 'react'
import { useStore } from '@/store/store'
import websocketService from '@/services/websocket.service'
import * as Shared from '@pokemon-timeline/shared'

const { WebSocketEvent } = Shared

export function useWebSocket() {
  const {
    addProject,
    updateProject,
    deleteProject,
    addEntry,
    updateEntry,
    deleteEntry,
    addCategory,
    updateCategory,
    removeCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    setExchangeRate,
  } = useStore()

  const callbacksRef = useRef<{ [key: string]: Function }>({})

  useEffect(() => {
    websocketService.connect()

    // Define all callbacks
    const callbacks = {
      // Project events
      [WebSocketEvent.PROJECT_CREATED]: (message: any) => {
        if (message?.data?.project) {
          addProject(message.data.project)
        }
      },
      [WebSocketEvent.PROJECT_UPDATED]: (message: any) => {
        if (message?.data?.project) {
          updateProject(message.data.project)
        }
      },
      [WebSocketEvent.PROJECT_DELETED]: (message: any) => {
        if (message?.data?.project?.id) {
          deleteProject(message.data.project.id)
        }
      },

      // Entry events
      [WebSocketEvent.ENTRY_CREATED]: (message: any) => {
        if (message?.data?.entry) {
          addEntry(message.data.entry)
        }
      },
      [WebSocketEvent.ENTRY_UPDATED]: (message: any) => {
        if (message?.data?.entry) {
          updateEntry(message.data.entry)
        }
      },
      [WebSocketEvent.ENTRY_DELETED]: (message: any) => {
        if (message?.data?.entry?.id && message.data.entry?.projectId) {
          deleteEntry(message.data.entry.id, message.data.entry.projectId)
        }
      },

      // Category events
      [WebSocketEvent.CATEGORY_CREATED]: (message: any) => {
        if (message?.data?.category) {
          addCategory(message.data.category)
        }
      },
      [WebSocketEvent.CATEGORY_UPDATED]: (message: any) => {
        if (message?.data?.category) {
          updateCategory(message.data.category.id, message.data.category)
        }
      },
      [WebSocketEvent.CATEGORY_DELETED]: (message: any) => {
        if (message?.data?.categoryId) {
          removeCategory(message.data.categoryId)
        }
      },

      // Expense events
      [WebSocketEvent.EXPENSE_CREATED]: (message: any) => {
        if (message?.data?.expense) {
          addExpense(message.data.expense)
        }
      },
      [WebSocketEvent.EXPENSE_UPDATED]: (message: any) => {
        if (message?.data?.expense) {
          updateExpense(message.data.expense)
        }
      },
      [WebSocketEvent.EXPENSE_DELETED]: (message: any) => {
        if (message?.data?.expense?.id) {
          deleteExpense(message.data.expense.id)
        }
      },

      // Income events
      [WebSocketEvent.INCOME_CREATED]: (message: any) => {
        if (message?.data?.income) {
          addIncome(message.data.income)
        }
      },
      [WebSocketEvent.INCOME_UPDATED]: (message: any) => {
        if (message?.data?.income) {
          updateIncome(message.data.income)
        }
      },
      [WebSocketEvent.INCOME_DELETED]: (message: any) => {
        if (message?.data?.income?.id) {
          deleteIncome(message.data.income.id)
        }
      },

      // Currency events
      [WebSocketEvent.CURRENCY_REFRESHED]: (message: any) => {
        if (message?.data?.rates && message.data.rates[0]) {
          const rate = message.data.rates[0]
          if (rate.fromCurrency === 'USDT' && rate.toCurrency === 'IDR') {
            setExchangeRate(rate.rate)
          }
        }
      },
    }

    // Store callbacks in ref for cleanup
    callbacksRef.current = callbacks

    // Register all listeners
    Object.entries(callbacks).forEach(([event, callback]) => {
      websocketService.on(event as Shared.WebSocketEvent, callback as any)
    })

    return () => {
      // Unregister all listeners with the correct callback references
      Object.entries(callbacksRef.current).forEach(([event, callback]) => {
        websocketService.off(event as Shared.WebSocketEvent, callback as any)
      })
      websocketService.disconnect()
    }
  }, [addProject, updateProject, deleteProject, addEntry, updateEntry, deleteEntry, addCategory, updateCategory, removeCategory, addExpense, updateExpense, deleteExpense, addIncome, updateIncome, deleteIncome, setExchangeRate])
}
