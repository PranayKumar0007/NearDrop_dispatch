import { useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useState } from 'react'

const STYLES = {
  success: { bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.2)',   icon: CheckCircle,    color: '#059669' },
  error:   { bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.2)',   icon: AlertTriangle,  color: '#dc2626' },
  info:    { bg: 'rgba(37,99,235,0.07)',   border: 'rgba(37,99,235,0.18)',  icon: Info,           color: '#2563eb' },
}

export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const s = STYLES[type] ?? STYLES.info
  const Icon = s.icon

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-slide-up"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: `1px solid ${s.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: s.color }} />
      <span className="text-sm font-medium flex-1" style={{ color: '#111117' }}>{message}</span>
      <button onClick={onClose} className="ml-1 transition-opacity opacity-40 hover:opacity-80">
        <X className="w-4 h-4" style={{ color: '#111117' }} />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map(t => (
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
    setToasts(prev => [...prev, { id, message, type }])
  }
  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id))
  return { toasts, addToast, removeToast }
}
