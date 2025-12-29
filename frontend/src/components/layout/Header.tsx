import { useState, useEffect } from 'react'
import { useStore } from '@/store/store'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocation } from 'react-router-dom'
import CurrencyToggle from '../currency/CurrencyToggle'
import ThemeToggle from '../common/ThemeToggle'

interface HeaderProps {
  onMobileMenuClick?: () => void
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const { setSearchQuery } = useStore()
  const { pathname } = useLocation()
  const [localSearchQuery, setLocalSearchQuery] = useState('')

  const getTitle = () => {
    if (pathname === '/projects') return 'Card Projects'
    if (pathname === '/timeline') return 'Timeline Events'
    if (pathname === '/expenses') return 'Expenses'
    if (pathname === '/settings') return 'Category Management'
    if (pathname === '/dashboard') return 'Dashboard'
    return 'Card Projects'
  }
  const title = getTitle()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (setSearchQuery) {
        setSearchQuery(localSearchQuery)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearchQuery, setSearchQuery])

  return (
    <header className="bg-bg-secondary border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        {/* Left: Mobile Hamburger + Title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input
              type="text"
              placeholder="Search for anything..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className="pl-10 bg-bg-primary border-border text-sm h-11 rounded-lg focus:ring-2 focus:ring-interactive focus:border-transparent"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Right: Currency Toggle + Theme Toggle */}
        <div className="flex items-center gap-3">
          <CurrencyToggle />
          <div className="w-px h-6 bg-bg-tertiary"></div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
