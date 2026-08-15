import React from 'react'
import { RefreshCw } from 'lucide-react'

import { bloodpointsIcon } from '../mediaIcons'

export const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-16">
    <RefreshCw className="w-5 h-5 text-faint animate-spin" />
  </div>
)

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <p className="text-sm text-red-400/80 py-8 text-center">{message}</p>
)

export const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <p className="text-sm text-ghost py-8 text-center">{label}</p>
)

export const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="select-option-badge shrink-0">{children}</span>
)

export const Pill: React.FC<{ label: string; value: string; iconSrc?: string }> = ({ label, value, iconSrc }) => (
  <div
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px]"
    style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
  >
    {iconSrc && <img src={iconSrc} alt="" className="w-3.5 h-3.5" />}
    <span className="text-faint uppercase tracking-wide">{label}</span>
    <span className="text-strong font-semibold font-mono">{value}</span>
  </div>
)

export const BloodpointsPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Pill label={label} value={value} iconSrc={bloodpointsIcon} />
)

interface FetchedListProps<T> {
  result: { data: T[] | null; error: string | null }
  emptyLabel: string
  children: (items: T[]) => React.ReactNode
}

export function FetchedList<T>({ result, emptyLabel, children }: FetchedListProps<T>): React.ReactElement {
  if (result.error) return <ErrorState message={result.error} />
  if (!result.data) return <LoadingState />
  if (result.data.length === 0) return <EmptyState label={emptyLabel} />
  return <>{children(result.data)}</>
}
