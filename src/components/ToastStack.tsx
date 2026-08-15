import React from 'react'
import { AnimatePresence } from 'framer-motion'
import Toast from './Toast'
import type { ToastItem } from '../lib/useToasts'

interface Props {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

const ToastStack: React.FC<Props> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end pointer-events-none">
    <AnimatePresence initial={false}>
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => onDismiss(toast.id)} />
      ))}
    </AnimatePresence>
  </div>
)

export default ToastStack
