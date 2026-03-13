import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, AlertCircle, Info, X, Zap } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', bar: 'bg-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
  error:   { icon: AlertCircle,  color: 'text-red-400',     bar: 'bg-red-400',     border: 'border-red-500/20',     bg: 'bg-red-500/5' },
  info:    { icon: Info,         color: 'text-accent',      bar: 'bg-accent',      border: 'border-accent/20',      bg: 'bg-accent/5' },
  power:   { icon: Zap,         color: 'text-violet-400',  bar: 'bg-violet-400',  border: 'border-violet-500/20',  bg: 'bg-violet-500/5' },
}

function Toast({ toast, onDismiss }) {
  const cfg = ICONS[toast.type] || ICONS.info
  const Icon = cfg.icon

  return (
    <div
      className={`
        relative overflow-hidden flex items-start gap-3 px-4 py-3 rounded-xl border
        ${cfg.border} ${cfg.bg}
        backdrop-blur bg-surface-900/90
        shadow-2xl shadow-black/40
        animate-slide-up
        min-w-64 max-w-sm
      `}
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} opacity-40 animate-[shrink_var(--dur)_linear_forwards]`}
        style={{ '--dur': `${toast.duration}ms` }}
      />
      <Icon size={15} className={`${cfg.color} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-display font-600 text-sm text-white">{toast.title}</div>
        )}
        {toast.message && (
          <div className={`font-body text-xs ${toast.title ? 'text-slate-400 mt-0.5' : 'text-slate-200'}`}>{toast.message}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id])
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((type, title, message, duration = 3500) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }])
    timersRef.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const api = {
    success: (title, msg, dur) => toast('success', title, msg, dur),
    error:   (title, msg, dur) => toast('error',   title, msg, dur),
    info:    (title, msg, dur) => toast('info',    title, msg, dur),
    power:   (title, msg, dur) => toast('power',   title, msg, dur),
    dismiss,
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
