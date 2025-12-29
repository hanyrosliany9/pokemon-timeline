import { StateCreator } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface UISlice {
  isLoading: boolean
  error: string | null
  toasts: Toast[]
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  showToast: (
    type: ToastType,
    message: string,
    duration?: number,
  ) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  clearError: () => void
}

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  isLoading: false,
  error: null,
  toasts: [],

  setIsLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  showToast: (type: ToastType, message: string, duration = 3000) => {
    const id = Date.now().toString()
    const newToast: Toast = { id, type, message, duration }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  clearError: () => {
    set({ error: null })
  },
})
