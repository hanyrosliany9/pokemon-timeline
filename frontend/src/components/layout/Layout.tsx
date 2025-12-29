import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useStore } from '@/store/store'
import expenseService from '@/services/expense.service'
import incomeService from '@/services/income.service'
import currencyService from '@/services/currency.service'
import { Toaster } from '@/components/ui/toaster'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const {
    setExpenses,
    setIncome,
    setExchangeRate,
    setError,
    fetchCategories,
  } = useStore()

  // Load initial data (expenses, income, exchange rate, and categories)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load categories first (needed for expense categorization)
        await fetchCategories()

        // Load expenses
        const expenses = await expenseService.getAll()
        setExpenses(expenses)

        // Load income
        const income = await incomeService.getAll()
        setIncome(income)

        // Load exchange rate
        const rateData = await currencyService.getRate()
        setExchangeRate(rateData.rate)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load data'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [setExpenses, setIncome, setExchangeRate, setError, fetchCategories])

  return (
    <div className="flex h-screen bg-bg-primary layout">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar - always visible */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-full">
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Mobile Drawer - Dialog-based */}
      <Dialog open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <DialogContent className="w-64 p-0 fixed left-0 top-0 h-full max-w-none translate-x-0 translate-y-0 rounded-none border-r border-l-0 border-t-0 border-b-0 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left">
          <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onMobileMenuClick={() => setIsSidebarOpen(true)} />

        {/* Main Content */}
        <main id="main-content" className="flex-1 overflow-auto p-6 lg:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-border border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-text-secondary text-sm">Loading...</p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <Toaster />
    </div>
  )
}
