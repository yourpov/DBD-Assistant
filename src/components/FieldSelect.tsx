import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

export interface FieldOption {
  value: string
  label: string
  recommended?: boolean
}

interface Props {
  value: string
  options: FieldOption[]
  onChange: (value: string) => void
  defaultValue?: string
  monospace?: boolean
}

const GAP = 6
const VIEWPORT_MARGIN = 12
const MIN_LIST_HEIGHT = 120
const MIN_LIST_WIDTH = 160
const DEFAULT_MAX_LIST_HEIGHT = 320

interface Pos {
  left: number
  width: number
  maxHeight: number
  anchor: 'top' | 'bottom'
  offset: number
}

const FieldSelect: React.FC<Props> = ({ value, options, onChange, defaultValue, monospace = true }) => {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos>({
    left: 0,
    width: 0,
    maxHeight: DEFAULT_MAX_LIST_HEIGHT,
    anchor: 'top',
    offset: 0,
  })
  const [highlighted, setHighlighted] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const selected = options.find(o => o.value === value) ?? options[0]

  const place = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom - VIEWPORT_MARGIN
    const spaceAbove = r.top - VIEWPORT_MARGIN
    const measuredHeight = listRef.current?.offsetHeight ?? 0
    const openUpward = measuredHeight > spaceBelow && spaceAbove > spaceBelow

    setPos(
      openUpward
        ? {
            left: r.left,
            width: r.width,
            maxHeight: Math.max(MIN_LIST_HEIGHT, spaceAbove),
            anchor: 'bottom',
            offset: window.innerHeight - r.top + GAP,
          }
        : {
            left: r.left,
            width: r.width,
            maxHeight: Math.max(MIN_LIST_HEIGHT, spaceBelow),
            anchor: 'top',
            offset: r.bottom + GAP,
          }
    )
  }

  useLayoutEffect(() => {
    if (!open) return
    setHighlighted(Math.max(0, options.findIndex(o => o.value === value)))
    place()
    const raf = requestAnimationFrame(place)
    return () => cancelAnimationFrame(raf)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlighted(i => Math.min(i + 1, options.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const opt = options[highlighted]
        if (opt) {
          onChange(opt.value)
          setOpen(false)
          triggerRef.current?.focus()
        }
      }
    }
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, options, highlighted, onChange])

  return (
    <div className="glow-input">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`glow-input-field select-trigger ${monospace ? 'font-mono' : ''}`}
      >
        {selected?.label ?? value}
        <ChevronDown size={14} className={`select-chevron ${open ? 'select-chevron--open' : ''}`} />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={listRef}
              role="listbox"
              initial={{ opacity: 0, scale: 0.97, y: pos.anchor === 'top' ? -4 : 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: pos.anchor === 'top' ? -4 : 4 }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="select-list"
              style={{
                left: pos.left,
                width: Math.max(pos.width, MIN_LIST_WIDTH),
                maxHeight: pos.maxHeight,
                overflowY: 'auto',
                [pos.anchor]: pos.offset,
              }}
            >
              {options.map((opt, i) => {
                const isSelected = opt.value === value
                const isDefault = defaultValue !== undefined && opt.value === defaultValue
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                    className={`select-option ${isSelected ? 'select-option--selected' : ''} ${i === highlighted ? 'select-option--highlighted' : ''}`}
                  >
                    <span className="select-option-check">{isSelected && <Check size={13} />}</span>
                    <span className="select-option-label">{opt.label}</span>
                    {opt.recommended && <span className="select-option-badge">Recommended</span>}
                    {isDefault && <span className="select-option-badge select-option-badge--default">Default</span>}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}

export default FieldSelect
