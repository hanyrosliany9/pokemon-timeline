import { Expense, Income } from './expense.types'
import { CardProject, CardEntry } from './project.types'
import { CurrencyRateUpdate } from './currency.types'

export enum WebSocketEvent {
  // Category events
  CATEGORY_CREATED = 'category:created',
  CATEGORY_UPDATED = 'category:updated',
  CATEGORY_DELETED = 'category:deleted',

  // Expense events
  EXPENSE_CREATED = 'expense:created',
  EXPENSE_UPDATED = 'expense:updated',
  EXPENSE_DELETED = 'expense:deleted',

  // Income events
  INCOME_CREATED = 'income:created',
  INCOME_UPDATED = 'income:updated',
  INCOME_DELETED = 'income:deleted',

  // Project events (card tracking)
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  PROJECT_DELETED = 'project:deleted',

  // Currency events
  CURRENCY_REFRESHED = 'currency:refreshed',

  // Card entry events
  ENTRY_CREATED = 'entry:created',
  ENTRY_UPDATED = 'entry:updated',
  ENTRY_DELETED = 'entry:deleted',

  // Connection events
  CONNECTION_ESTABLISHED = 'connection:established',
  CONNECTION_ERROR = 'connection:error',
}

export interface WebSocketMessage<T = any> {
  event: WebSocketEvent
  data: T
  timestamp: string
  clientId?: string
}

// Event-specific payload types
export interface ExpenseEventPayload {
  expense: Expense
  action: 'create' | 'update' | 'delete'
}

export interface IncomeEventPayload {
  income: Income
  action: 'create' | 'update' | 'delete'
}

export interface ProjectEventPayload {
  project: CardProject
  action: 'create' | 'update' | 'delete'
}

export interface CurrencyEventPayload {
  rates: CurrencyRateUpdate[]
}

export interface EntryEventPayload {
  entry: CardEntry
  action: 'create' | 'update' | 'delete'
}

export type WebSocketPayload =
  | ExpenseEventPayload
  | IncomeEventPayload
  | ProjectEventPayload
  | CurrencyEventPayload
  | EntryEventPayload
  | any
