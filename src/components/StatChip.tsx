import React from 'react'

interface Props {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'default' | 'success'
  monospace?: boolean
}

const TONE_STYLES: Record<'default' | 'success', React.CSSProperties> = {
  default: {
    borderColor: 'rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-text-faint)',
  },
  success: {
    borderColor: 'rgba(74,222,128,0.25)',
    background: 'rgba(74,222,128,0.08)',
    color: 'rgb(74,222,128)',
  },
}

const StatChip: React.FC<Props> = ({ icon, label, value, tone = 'default', monospace = false }) => (
  <div>
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={TONE_STYLES[tone]}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className={`text-xl font-bold text-strong mt-1.5 ${monospace ? 'font-mono' : ''}`}>{value}</div>
  </div>
)

export default StatChip
