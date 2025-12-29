import { Currency } from '../enums/currency.enum'

export interface ExchangeRate {
  id: string
  fromCurrency: Currency
  toCurrency: Currency
  rate: string | number
  provider: 'coingecko' | 'binance'
  timestamp: string | Date
  createdAt: string | Date
}

export interface CurrencyCache {
  id: string
  fromCurrency: Currency
  toCurrency: Currency
  rate: string | number
  provider: 'coingecko' | 'binance'
  expiresAt: string | Date
  updatedAt: string | Date
}

export interface GetExchangeRateResponse {
  fromCurrency: Currency
  toCurrency: Currency
  rate: string | number
  provider: string
  timestamp: string
  cacheAge?: string // e.g., "5 minutes"
}

export interface ConvertCurrencyRequest {
  amount: string | number
  fromCurrency: Currency
  toCurrency: Currency
}

export interface ConvertCurrencyResponse {
  originalAmount: string | number
  fromCurrency: Currency
  convertedAmount: string | number
  toCurrency: Currency
  rate: string | number
  timestamp: string
}

export interface CurrencyRateUpdate {
  fromCurrency: Currency
  toCurrency: Currency
  rate: string | number
  provider: string
  timestamp: string
}
