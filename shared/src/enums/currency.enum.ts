export enum Currency {
  USDT = 'USDT',
  IDR = 'IDR',
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USDT]: '$',
  [Currency.IDR]: 'Rp',
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  [Currency.USDT]: 'USDT (Tether)',
  [Currency.IDR]: 'IDR (Indonesian Rupiah)',
}
