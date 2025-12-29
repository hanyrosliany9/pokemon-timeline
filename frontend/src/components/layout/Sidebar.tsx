import { FolderKanban, Wallet, Tags } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const navItems = [
    { to: '/projects', icon: FolderKanban, label: 'Card Projects' },
    { to: '/expenses', icon: Wallet, label: 'Expenses' },
  ]

  const settingsItems = [
    { to: '/settings', icon: Tags, label: 'Categories' },
  ]

  return (
    <aside className="w-full h-full bg-bg-primary text-text-primary flex flex-col" role="navigation" aria-label="Main navigation">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-semibold">Pokemon</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-text-tertiary hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings at Bottom */}
      {settingsItems.length > 0 && (
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs font-semibold text-text-secondary uppercase px-4 mb-3">Manage</p>
          <ul className="space-y-1">
            {settingsItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-text-tertiary hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
