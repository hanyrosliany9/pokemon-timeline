import { StateCreator } from 'zustand'

export interface CurrencySlice {
  exchangeRate: string
  preferredCurrency: 'USDT' | 'IDR'
  setExchangeRate: (rate: string) => void
  setPreferredCurrency: (currency: 'USDT' | 'IDR') => void
}

export const createCurrencySlice: StateCreator<CurrencySlice> = (set) => ({
  exchangeRate: '15500',
  preferredCurrency: 'USDT',

  setExchangeRate: (rate: string) => {
    set({ exchangeRate: rate })
  },

  setPreferredCurrency: (currency: 'USDT' | 'IDR') => {
    set({ preferredCurrency: currency })
  },
})
