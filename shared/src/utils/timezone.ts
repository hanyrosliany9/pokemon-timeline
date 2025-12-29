/**
 * Timezone Utilities for UTC+7 (Indonesia/Jakarta)
 *
 * This module standardizes all date/time handling to UTC+7 timezone
 * across both frontend and backend.
 */

// UTC+7 offset in milliseconds (7 hours)
export const UTC7_OFFSET_MS = 7 * 60 * 60 * 1000

// UTC+7 offset in hours
export const UTC7_OFFSET_HOURS = 7

// IANA timezone identifier for UTC+7
export const TIMEZONE_ID = 'Asia/Jakarta'

// Timezone display name
export const TIMEZONE_NAME = 'WIB (UTC+7)'

/**
 * Get current Date object adjusted to UTC+7
 * Returns a Date that represents the current time in UTC+7
 */
export function getNowUTC7(): Date {
  const now = new Date()
  // Get UTC time, then add UTC+7 offset
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  return new Date(utcTime + UTC7_OFFSET_MS)
}

/**
 * Get today's date string in YYYY-MM-DD format (UTC+7)
 */
export function getTodayUTC7(): string {
  const now = getNowUTC7()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get current time string in HH:mm:ss format (UTC+7)
 */
export function getTimeUTC7(): string {
  const now = getNowUTC7()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

/**
 * Get current datetime string in ISO-like format (UTC+7)
 * Format: YYYY-MM-DDTHH:mm:ss+07:00
 */
export function getDateTimeUTC7(): string {
  return `${getTodayUTC7()}T${getTimeUTC7()}+07:00`
}

/**
 * Convert a UTC Date to UTC+7 Date
 */
export function toUTC7(date: Date): Date {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000
  return new Date(utcTime + UTC7_OFFSET_MS)
}

/**
 * Parse a date string and return it as UTC+7 Date
 * Handles both YYYY-MM-DD and full ISO strings
 */
export function parseAsUTC7(dateStr: string): Date {
  // If it's just a date (YYYY-MM-DD), treat it as midnight UTC+7
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // Parse as local date at noon to avoid DST issues, then adjust
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
    // Adjust from UTC noon to UTC+7 midnight
    date.setTime(date.getTime() - 12 * 60 * 60 * 1000 - UTC7_OFFSET_MS)
    return new Date(date.getTime() + UTC7_OFFSET_MS)
  }

  // For full ISO strings, convert to UTC+7
  return toUTC7(new Date(dateStr))
}

/**
 * Format a Date to YYYY-MM-DD string in UTC+7
 */
export function formatDateUTC7(date: Date): string {
  const utc7Date = toUTC7(date)
  const year = utc7Date.getFullYear()
  const month = String(utc7Date.getMonth() + 1).padStart(2, '0')
  const day = String(utc7Date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format a Date to full datetime string in UTC+7
 * Format: YYYY-MM-DD HH:mm:ss
 */
export function formatDateTimeUTC7(date: Date): string {
  const utc7Date = toUTC7(date)
  const dateStr = formatDateUTC7(date)
  const hours = String(utc7Date.getHours()).padStart(2, '0')
  const minutes = String(utc7Date.getMinutes()).padStart(2, '0')
  const seconds = String(utc7Date.getSeconds()).padStart(2, '0')
  return `${dateStr} ${hours}:${minutes}:${seconds}`
}

/**
 * Check if a date string is in the future (compared to UTC+7 now)
 */
export function isFutureDateUTC7(dateStr: string): boolean {
  const todayStr = getTodayUTC7()
  return dateStr > todayStr
}

/**
 * Get start of day in UTC+7 as a UTC Date
 * Useful for database queries
 */
export function getStartOfDayUTC7(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  // Midnight UTC+7 = 17:00 previous day in UTC
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - UTC7_OFFSET_MS)
}

/**
 * Get end of day in UTC+7 as a UTC Date
 * Useful for database queries
 */
export function getEndOfDayUTC7(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  // 23:59:59.999 UTC+7 = 16:59:59.999 in UTC
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) - UTC7_OFFSET_MS)
}
