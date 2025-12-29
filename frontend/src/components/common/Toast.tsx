import { useEffect } from 'react'
import { Toast as ToastType } from '@/store/slices/ui.slice'
import { useStore } from '@/store/store'
import { X } from 'lucide-react'

interface ToastProps {
  toast: ToastType
}

export default function Toast({ toast }: ToastProps) {
  const { removeToast } = useStore()

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast, removeToast])

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-message">{toast.message}</div>
      <button
        className="toast-close"
        onClick={() => removeToast(toast.id)}
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
    </div>
  )
}
