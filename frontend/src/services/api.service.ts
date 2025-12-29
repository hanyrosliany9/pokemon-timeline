import axios, { AxiosInstance, AxiosError } from 'axios'

class ApiService {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      },
    )
  }

  async get<T = any>(url: string, config = {}): Promise<T> {
    return this.client.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config = {}): Promise<T> {
    return this.client.post<T>(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config = {}): Promise<T> {
    return this.client.patch<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config = {}): Promise<T> {
    return this.client.put<T>(url, data, config)
  }

  async delete<T = any>(url: string, config = {}): Promise<T> {
    return this.client.delete<T>(url, config)
  }

  getBaseURL(): string {
    return this.baseURL
  }
}

export default new ApiService()
