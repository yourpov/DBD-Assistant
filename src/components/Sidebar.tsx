import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AppModule } from '../lib/modules'
import { readStoredValue, writeStoredValue } from '../lib/localStorage'
import Tooltip from './Tooltip'

const COLLAPSE_KEY = 'dbd-assistant.sidebar.collapsed'
const COLLAPSED = '1'
const EXPANDED = '0'

interface Props {
  modules: AppModule[]
  activeId: string
  onSelect: (id: string) => void
}

const Sidebar: React.FC<Props> = ({ modules, activeId, onSelect }) => {
  const [collapsed, setCollapsed] = useState(() => readStoredValue(COLLAPSE_KEY) === COLLAPSED)

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      writeStoredValue(COLLAPSE_KEY, next ? COLLAPSED : EXPANDED)
      return next
    })
  }

  return (
    <aside
      className={`flex flex-col shrink-0 h-full border-r border-white/5 transition-[width] duration-300 ease-out ${collapsed ? 'w-14' : 'w-44'}`}
      style={{ background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)' }}
    >
      <nav className={`flex-1 flex flex-col gap-0.5 py-3 ${collapsed ? 'px-2' : 'px-2.5'}`}>
        {modules.map(mod => {
          const Icon = mod.icon
          const active = mod.id === activeId
          return (
            <button
              key={mod.id}
              onClick={() => onSelect(mod.id)}
              title={collapsed ? mod.label : undefined}
              className={`relative flex items-center min-w-0 rounded-lg py-2.5 text-left text-[13px] transition-colors cursor-pointer ${collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'} ${active ? 'bg-primary/15 text-primary-bright font-semibold' : 'text-tertiary hover:bg-white/5 hover:text-secondary'}`}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary-bright" />}
              <Icon size={18} className="shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="min-w-0 overflow-hidden whitespace-nowrap text-ellipsis"
                  >
                    {mod.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </nav>

      <div className={`border-t border-white/5 py-2 ${collapsed ? 'px-2 flex justify-center' : 'px-2.5'}`}>
        <Tooltip label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="top">
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex items-center justify-center rounded-lg text-faint hover:text-tertiary hover:bg-white/5 cursor-pointer ${collapsed ? 'w-9 h-9' : 'w-full h-9'}`}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}

export default Sidebar
