'use client'

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (message: string, type?: ToastItem['type']) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const typeStyles = {
  success: { background: '#F0FAF2', border: '1.5px solid #BBF7D0', color: '#3B8A5A', icon: '✓' },
  error:   { background: '#FFF0EC', border: '1.5px solid #F5C4B0', color: '#C85030', icon: '✕' },
  info:    { background: '#EEF3FC', border: '1.5px solid #C5D9FA', color: '#4285F4', icon: 'ℹ' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = ++nextId.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[180] flex flex-col gap-2 items-center pointer-events-none"
        style={{ maxWidth: '90vw', width: 'max-content' }}>
        {toasts.map((toast) => {
          const s = typeStyles[toast.type]
          return (
            <div key={toast.id}
              style={{
                background: s.background,
                border: s.border,
                color: s.color,
                borderRadius: '999px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                whiteSpace: 'nowrap',
              }}>
              <style>{`
                @keyframes toastIn {
                  from { opacity: 0; transform: translateY(16px) scale(0.9); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
              <span style={{ fontWeight: 900 }}>{s.icon}</span>
              {toast.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
