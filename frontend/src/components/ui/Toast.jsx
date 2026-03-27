import { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-teal-400" />,
  error:   <AlertTriangle className="w-5 h-5 text-red-400" />,
  info:    <Info className="w-5 h-5 text-blue-400" />,
}

export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-card',
        'border backdrop-blur-md animate-slide-up',
        type === 'success' && 'bg-teal-500/15 border-teal-500/30',
        type === 'error'   && 'bg-red-500/15 border-red-500/30',
        type === 'info'    && 'bg-blue-500/15 border-blue-500/30',
      )}
    >
      {ICONS[type]}
      <span className="text-sm font-medium text-white/90">{message}</span>
      <button onClick={onClose} className="ml-auto text-white/40 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  )
}

let toastId = 0
export function useToasts() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return { toasts, addToast, removeToast }
}
