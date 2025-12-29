import { LucideIcon } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Category, ExpenseCategory } from '@pokemon-timeline/shared'

/**
 * Legacy mapping of expense categories to their corresponding Lucide icons
 * (Kept for backward compatibility with old ExpenseCategory enum)
 */
export const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  [ExpenseCategory.CROPPING]: Icons.Scissors,
  [ExpenseCategory.MOTION_WORK]: Icons.Video,
  [ExpenseCategory.TOOLS]: Icons.Wrench,
  [ExpenseCategory.SOFTWARE]: Icons.Code,
  [ExpenseCategory.HARDWARE]: Icons.Cpu,
  [ExpenseCategory.OUTSOURCING]: Icons.Users,
  [ExpenseCategory.MISCELLANEOUS]: Icons.MoreHorizontal,
}

/**
 * Get icon component by name from Lucide icons
 */
export function getIconByName(iconName: string): LucideIcon {
  const icon = Icons[iconName as keyof typeof Icons] as LucideIcon | undefined
  return icon || Icons.MoreHorizontal
}

/**
 * Convert hex color to Tailwind classes (simplified - returns style object)
 */
export function hexToTailwindStyle(hexColor: string) {
  return {
    backgroundColor: hexColor + '15', // 15% opacity background
    color: hexColor,
    borderColor: hexColor + '30', // 30% opacity border
  }
}

interface CategoryIconProps {
  category: ExpenseCategory | Category
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Renders the icon for a given expense category (supports both enum and Category object)
 */
export function CategoryIcon({ category, className = '', size = 'md' }: CategoryIconProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  let Icon: LucideIcon

  if (typeof category === 'string') {
    // Legacy: ExpenseCategory enum
    Icon = CATEGORY_ICONS[category as ExpenseCategory]
  } else {
    // New: Category object with icon name
    Icon = getIconByName(category.icon)
  }

  return <Icon className={`${sizeMap[size]} ${className}`} />
}

interface CategoryBadgeProps {
  category: ExpenseCategory | Category
  showIcon?: boolean
  showLabel?: boolean
}

/**
 * Renders a styled badge for a category with optional icon and label
 * Supports both legacy enum and new Category object
 */
export function CategoryBadge({ category, showIcon = true, showLabel = true }: CategoryBadgeProps) {
  let Icon: LucideIcon
  let label: string
  let style: React.CSSProperties | undefined

  if (typeof category === 'string') {
    // Legacy: ExpenseCategory enum
    Icon = CATEGORY_ICONS[category as ExpenseCategory]
    label = category.replace(/_/g, ' ')
  } else {
    // New: Category object
    Icon = getIconByName(category.icon)
    label = category.label
    style = hexToTailwindStyle(category.color)
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-md border"
      style={style}
    >
      {showIcon && <Icon className="w-4 h-4" />}
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}
