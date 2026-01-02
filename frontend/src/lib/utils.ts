import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes with conflict resolution
 * Combines clsx for conditional classes with twMerge for Tailwind-specific merging
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a date value and return a valid Date object or null
 */
export function safeParseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Format a date safely, returning fallback if invalid
 */
export function formatDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  locale = 'id-ID',
  fallback = '-'
): string {
  const date = safeParseDate(value)
  if (!date) return fallback
  return date.toLocaleDateString(locale, options)
}

/**
 * Format a date with short month and day (e.g., "Jan 4")
 */
export function formatShortDate(value: string | Date | null | undefined, fallback = '-'): string {
  return formatDate(value, { month: 'short', day: 'numeric' }, 'id-ID', fallback)
}

/**
 * Format a date with weekday, short month and day (e.g., "Wed, Jan 4")
 */
export function formatFullDate(value: string | Date | null | undefined, fallback = '-'): string {
  return formatDate(value, { weekday: 'short', month: 'short', day: 'numeric' }, 'id-ID', fallback)
}
