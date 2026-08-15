import React from 'react'

interface Props {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  'aria-label'?: string
}

const Toggle: React.FC<Props> = ({ checked, onChange, disabled, ...aria }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className="relative w-9 h-5 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    style={{ background: checked ? 'var(--color-primary)' : 'rgba(255,255,255,0.14)' }}
    {...aria}
  >
    <span
      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
      style={{ left: checked ? '18px' : '2px' }}
    />
  </button>
)

export default Toggle
