import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

const VARIANTS = {
  success: { color: 'text-emerald-400', Icon: CheckCircle2 },
  error: { color: 'text-red-400', Icon: XCircle },
  info: { color: 'text-primary-bright', Icon: Info },
} as const

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const { color, Icon } = VARIANTS[type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
      className="glass-lg text-white/90 rounded-lg px-5 py-3.5 shadow-2xl flex items-start gap-3 max-w-md pointer-events-auto"
    >
      <span className={`${color} mt-0.5 shrink-0`}><Icon className="w-5 h-5" /></span>
      <span className="font-medium text-sm min-w-0 flex-1 break-words">{message}</span>
      <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer shrink-0">✕</button>
    </motion.div>
  )
}

export default Toast
