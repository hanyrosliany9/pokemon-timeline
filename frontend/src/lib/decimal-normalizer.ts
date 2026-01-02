import { Decimal } from 'decimal.js'

/**
 * Normalizes serialized Decimal values from API responses
 * Decimal.js objects are serialized as {s, e, d} format
 * We reconstruct them using Decimal.js to ensure accurate conversion
 */

export function normalizeDecimalValue(value: any): string {
  // If it's already a string, return as-is
  if (typeof value === 'string') {
    return value
  }

  // If it's a number, convert to string with appropriate precision
  if (typeof value === 'number') {
    return String(value)
  }

  // Handle serialized Decimal format: {s: sign, e: exponent, d: [digits]}
  if (value && typeof value === 'object' && 's' in value && 'e' in value && 'd' in value) {
    try {
      // Reconstruct a Decimal object from the serialized data
      // Create a new Decimal and set its internal properties
      const decimal = new Decimal(0)
      Object.assign(decimal, { s: value.s, e: value.e, d: value.d })
      return decimal.toString()
    } catch {
      // Fallback: try to create a Decimal from the raw value
      try {
        return new Decimal(JSON.stringify(value)).toString()
      } catch {
        return '0'
      }
    }
  }

  // Fallback for unrecognized format
  return '0'
}

/**
 * Normalizes an Expense object to ensure all Decimal fields are converted to numbers/strings
 */
export function normalizeExpense(expense: any) {
  return {
    ...expense,
    amount: normalizeDecimalValue(expense.amount),
    amountUSDT: normalizeDecimalValue(expense.amountUSDT),
    amountIDR: normalizeDecimalValue(expense.amountIDR),
  }
}

/**
 * Normalizes an Income object to ensure all Decimal fields are converted to numbers/strings
 */
export function normalizeIncome(income: any) {
  return {
    ...income,
    amount: normalizeDecimalValue(income.amount),
    amountUSDT: normalizeDecimalValue(income.amountUSDT),
    amountIDR: normalizeDecimalValue(income.amountIDR),
  }
}

/**
 * Normalizes a Project object to ensure Decimal fields are converted to strings
 */
export function normalizeProject(project: any) {
  return {
    ...project,
    pricePerCardUSDT: project.pricePerCardUSDT
      ? normalizeDecimalValue(project.pricePerCardUSDT)
      : null,
  }
}
