import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      {Icon && (
        <div className="mb-5 p-5 rounded-full bg-ios-background-secondary shadow-ios-1">
          <Icon className="h-12 w-12 text-ios-tertiary-label" />
        </div>
      )}
      <h3 className="text-ios-title-2 font-bold mb-2 text-ios-label">{title}</h3>
      {description && (
        <p className="text-ios-body text-ios-secondary-label mb-8 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      )}
    </div>
  )
}
