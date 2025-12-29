export enum ExpenseCategory {
  CROPPING = 'CROPPING',
  MOTION_WORK = 'MOTION_WORK',
  TOOLS = 'TOOLS',
  SOFTWARE = 'SOFTWARE',
  HARDWARE = 'HARDWARE',
  OUTSOURCING = 'OUTSOURCING',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.CROPPING]: 'Cropping',
  [ExpenseCategory.MOTION_WORK]: 'Motion Work',
  [ExpenseCategory.TOOLS]: 'Tools',
  [ExpenseCategory.SOFTWARE]: 'Software',
  [ExpenseCategory.HARDWARE]: 'Hardware',
  [ExpenseCategory.OUTSOURCING]: 'Outsourcing',
  [ExpenseCategory.MISCELLANEOUS]: 'Miscellaneous',
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.CROPPING]: 'bg-purple-100 text-purple-800',
  [ExpenseCategory.MOTION_WORK]: 'bg-blue-100 text-blue-800',
  [ExpenseCategory.TOOLS]: 'bg-orange-100 text-orange-800',
  [ExpenseCategory.SOFTWARE]: 'bg-green-100 text-green-800',
  [ExpenseCategory.HARDWARE]: 'bg-red-100 text-red-800',
  [ExpenseCategory.OUTSOURCING]: 'bg-pink-100 text-pink-800',
  [ExpenseCategory.MISCELLANEOUS]: 'bg-gray-100 text-gray-800',
}
