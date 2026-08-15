import React, { useState } from 'react'
import { Search } from 'lucide-react'

import { useFetch } from '../../../lib/useFetch'
import type { CatalogEntry } from '../types'
import { Badge, EmptyState, ErrorState, LoadingState } from './TabPrimitives'

interface CatalogTabProps {
  fetchFn: () => Promise<CatalogEntry[]>
  searchPlaceholder: string
  emptyLabel: string
  iconFor?: (name: string) => string | undefined
  extraTags?: (id: string) => string[]
}

export const CatalogTab: React.FC<CatalogTabProps> = ({ fetchFn, searchPlaceholder, emptyLabel, iconFor, extraTags }) => {
  const { data, error } = useFetch(fetchFn)
  const [query, setQuery] = useState('')

  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState />

  const search = query.trim().toLowerCase()
  const filtered = search ? data.filter(entry => entry.name.toLowerCase().includes(search)) : data

  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0c0c0e] border border-white/10 focus-within:border-primary-bright/40 mb-3">
        <Search size={14} className="text-faint shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent border-0 outline-none focus-visible:shadow-none text-sm text-strong placeholder:text-faint"
        />
      </div>
      {filtered.length === 0 ? (
        <EmptyState label={query ? `Nothing matches "${query}".` : emptyLabel} />
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <CatalogRow key={entry.id} entry={entry} icon={iconFor?.(entry.name)} extraTags={extraTags?.(entry.id) ?? []} />
          ))}
        </div>
      )}
    </div>
  )
}

const CatalogRow: React.FC<{ entry: CatalogEntry; icon?: string; extraTags: string[] }> = ({ entry, icon, extraTags }) => (
  <div className="panel rounded-lg px-4 py-3 flex gap-3">
    {icon && <img src={icon} alt="" className="w-10 h-10 rounded-md object-cover shrink-0 bg-black/20" />}
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-sm font-semibold text-strong">{entry.name}</span>
        {[...entry.tags, ...extraTags].filter(Boolean).map(tag => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      {entry.description && (
        <p className="text-xs text-tertiary leading-relaxed whitespace-pre-wrap">{entry.description}</p>
      )}
    </div>
  </div>
)

export default CatalogTab
