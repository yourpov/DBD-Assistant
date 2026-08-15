import React from 'react'

interface Props {
  label: string
  children: React.ReactNode
  placement?: 'top' | 'bottom'
}

const Tooltip: React.FC<Props> = ({ label, children, placement = 'bottom' }) => (
  <div className="tooltip-wrap">
    {children}
    <div className={`tooltip-bubble ${placement === 'top' ? 'tooltip-bubble--top' : ''}`}>{label}</div>
  </div>
)

export default Tooltip
