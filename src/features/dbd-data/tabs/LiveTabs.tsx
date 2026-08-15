import React from 'react'
import { ScrollText } from 'lucide-react'

import CollapsibleSection from '../../../components/CollapsibleSection'
import { formatDate } from '../../../lib/format'
import { useFetch } from '../../../lib/useFetch'
import * as api from '../api'
import type { DataVersion, DlcEntry, GameEvent, GameMode, KillswitchEntry, PatchNotes } from '../types'
import { Badge, EmptyState, ErrorState, FetchedList, LoadingState } from './TabPrimitives'

type PatchNoteGroup = { kind: 'listItem'; items: string[] } | { kind: 'heading' | 'paragraph'; text: string }

function groupPatchNoteBlocks(blocks: PatchNotes['blocks']): PatchNoteGroup[] {
  const groups: PatchNoteGroup[] = []
  for (const block of blocks) {
    if (block.kind === 'listItem') {
      const last = groups[groups.length - 1]
      if (last?.kind === 'listItem') last.items.push(block.text)
      else groups.push({ kind: 'listItem', items: [block.text] })
    } else {
      groups.push({ kind: block.kind, text: block.text })
    }
  }
  return groups
}

export const PatchNotesTab: React.FC = () => {
  const { data, error } = useFetch(api.getLatestPatchNotes)
  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState />
  if (data.blocks.length === 0) return <EmptyState label="Unavailable right now." />

  const groups = groupPatchNoteBlocks(data.blocks)

  return (
    <div className="panel rounded-xl px-7 py-6">
      <div className="flex items-center gap-2 mb-5">
        <ScrollText size={15} className="text-primary-bright" />
        <span className="text-sm font-semibold text-secondary">Patch Notes ({data.version})</span>
      </div>
      <div className="max-h-[32rem] overflow-auto pr-1">
        {groups.map((group, i) =>
          group.kind === 'listItem' ? (
            <ul key={i} className="list-disc list-inside space-y-1 mb-3 text-xs text-tertiary leading-relaxed">
              {group.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : group.kind === 'heading' ? (
            <h3 key={i} className="text-sm font-semibold text-strong mt-4 mb-2 first:mt-0">
              {group.text}
            </h3>
          ) : (
            <p key={i} className="text-xs text-tertiary leading-relaxed mb-3 whitespace-pre-wrap">
              {group.text}
            </p>
          )
        )}
      </div>
    </div>
  )
}

export const GameModesTab: React.FC = () => {
  const { data, error } = useFetch(api.getGamemodes)
  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState />
  if (data.length === 0) return <EmptyState label="No featured game modes right now." />

  return (
    <div className="space-y-2">
      {data.map((mode: GameMode) => (
        <div key={mode.id} className="panel rounded-xl px-6 py-4 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-strong">{mode.name}</span>
          {mode.limitedTime && <Badge>Limited-time</Badge>}
        </div>
      ))}
    </div>
  )
}

export const LiveStatusTab: React.FC = () => {
  const rankReset = useFetch(api.getRankReset)
  const events = useFetch(api.getEvents)
  const killswitch = useFetch(api.getKillswitch)
  const versions = useFetch(api.getDataVersions)

  return (
    <div className="space-y-3">
      <div className="panel rounded-xl px-6 py-4">
        <div className="text-xs uppercase tracking-widest text-faint mb-1.5">Next Rank Reset</div>
        {rankReset.error ? (
          <ErrorState message={rankReset.error} />
        ) : rankReset.data === null ? (
          <LoadingState />
        ) : (
          <div className="text-lg font-semibold text-strong">{formatDate(rankReset.data)}</div>
        )}
      </div>

      <CollapsibleSection
        title="Killswitched Content"
        meta={killswitch.data ? `${killswitch.data.length} disabled` : undefined}
      >
        <FetchedList result={killswitch} emptyLabel="Nothing is currently killswitched.">
          {list =>
            list.map((k: KillswitchEntry) => (
              <div key={k.item} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-secondary">{k.item}</span>
                <Badge>{k.itemType}</Badge>
              </div>
            ))
          }
        </FetchedList>
      </CollapsibleSection>

      <CollapsibleSection title="Events" meta={events.data ? `${events.data.length}` : undefined} defaultOpen={false}>
        <FetchedList result={events} emptyLabel="No events on record.">
          {list =>
            list.map((e: GameEvent, i: number) => (
              <div key={`${e.name}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm text-secondary truncate">{e.name}</div>
                  <div className="text-xs text-ghost">
                    {formatDate(e.startUnix)} &ndash; {formatDate(e.endUnix)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {e.bonusMultiplier > 0 && <Badge>x{e.bonusMultiplier}</Badge>}
                  <Badge>{e.eventType}</Badge>
                </div>
              </div>
            ))
          }
        </FetchedList>
      </CollapsibleSection>

      <CollapsibleSection title="Data Versions" defaultOpen={false}>
        <FetchedList result={versions} emptyLabel="No versions on record.">
          {list =>
            list.map((v: DataVersion) => (
              <div key={v.category} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-secondary capitalize">{v.category}</span>
                <div className="flex items-center gap-3 text-xs text-faint font-mono">
                  <span>{v.version}</span>
                  <span>{formatDate(v.lastUpdateUnix)}</span>
                </div>
              </div>
            ))
          }
        </FetchedList>
      </CollapsibleSection>
    </div>
  )
}

export const DlcTab: React.FC = () => {
  const { data, error } = useFetch(api.getDlc)
  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState />
  if (data.length === 0) return <EmptyState label="No chapters on record." />

  return (
    <div className="panel rounded-xl overflow-hidden divide-y divide-white/5">
      {data.map((dlc: DlcEntry) => (
        <div key={dlc.id} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-secondary">{dlc.name}</span>
          <span className="text-xs text-faint font-mono">{dlc.releaseUnix > 0 ? formatDate(dlc.releaseUnix) : 'N/A'}</span>
        </div>
      ))}
    </div>
  )
}
