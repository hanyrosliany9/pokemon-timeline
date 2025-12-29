import apiService from './api.service'

class CurrencyService {
  async getRate() {
    return apiService.get(`/api/currency/rate`)
  }

  async convert(amount: string, fromCurrency: string, toCurrency: string) {
    return apiService.post(`/api/currency/convert`, {
      amount,
      fromCurrency,
      toCurrency,
    })
  }
}

export default new CurrencyService()
