import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Props {
  title: string
  meta?: React.ReactNode
  defaultOpen?: boolean
  dirty?: boolean
  headerAction?: React.ReactNode
  children: React.ReactNode
}

const CollapsibleSection: React.FC<Props> = ({ title, meta, defaultOpen = true, dirty, headerAction, children }) => {
  const [open, setOpen] = useState(defaultOpen)

  const toggle = () => {
    setOpen(o => !o)
  }

  return (
    <div className="panel rounded-xl overflow-hidden">
      <div
        onClick={toggle}
        role="button"
        tabIndex={0}
        className="w-full flex items-center gap-2.5 px-4 py-4 hover:bg-white/[0.03] cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-bright/30"
      >
        {dirty && <span className="w-1.5 h-1.5 rounded-full bg-primary-bright shrink-0" />}
        <div className="flex-1 flex items-center gap-2.5 text-left min-w-0">
          <span className="text-sm font-semibold text-secondary truncate">{title}</span>
          {meta && <span className="text-xs text-ghost shrink-0">{meta}</span>}
        </div>
        <ChevronDown size={15} className={`text-faint transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        {headerAction}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-white/5 border-t border-white/5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CollapsibleSection
