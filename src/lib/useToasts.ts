import { useCallback, useRef, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const TOAST_LIFETIME_MS = 4000
const MAX_VISIBLE_TOASTS = 3

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  // Both callbacks keep a stable identity so callers can list them as effect
  // dependencies without re-running the effect on every render.
  const addToast = useCallback((message: string, type: ToastType) => {
    const id = nextId.current++
    setToasts(prev => [...prev, { id, message, type }].slice(-MAX_VISIBLE_TOASTS))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, TOAST_LIFETIME_MS)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, dismissToast }
}
