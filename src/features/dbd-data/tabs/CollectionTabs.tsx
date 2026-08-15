import React from 'react'

import CollapsibleSection from '../../../components/CollapsibleSection'
import { useFetch } from '../../../lib/useFetch'
import * as api from '../api'
import type { Archive, Journal, Rift } from '../types'
import { Badge, FetchedList } from './TabPrimitives'

export const ArchivesTab: React.FC = () => {
  const archives = useFetch(api.getArchives)

  return (
    <div className="space-y-2">
      <FetchedList result={archives} emptyLabel="No archives on record.">
        {list =>
          list.map((tome: Archive) => (
            <CollapsibleSection key={tome.id} title={tome.name} meta={`${tome.levels.length} levels`} defaultOpen={false}>
              {tome.levels.map(level => (
                <div key={level.level} className="px-4 py-3">
                  <div className="text-xs uppercase tracking-wider text-faint mb-2">Level {level.level}</div>
                  <div className="space-y-2">
                    {level.nodes.map((node, i) => (
                      <div key={i} className="panel rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-strong">{node.name}</span>
                          <Badge>{node.role}</Badge>
                        </div>
                        <p className="text-xs text-tertiary leading-relaxed whitespace-pre-wrap">{node.objective}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CollapsibleSection>
          ))
        }
      </FetchedList>
    </div>
  )
}

export const JournalsTab: React.FC = () => {
  const journals = useFetch(api.getJournals)

  return (
    <div className="space-y-2">
      <FetchedList result={journals} emptyLabel="No journals on record.">
        {list =>
          list.map((tome: Journal) => (
            <CollapsibleSection key={tome.id} title={tome.title} meta={`${tome.entries.length} entries`} defaultOpen={false}>
              {tome.entries.map((entry, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="text-sm font-semibold text-strong mb-1">{entry.title}</div>
                  <p className="text-xs text-tertiary leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                </div>
              ))}
            </CollapsibleSection>
          ))
        }
      </FetchedList>
    </div>
  )
}

export const RiftTab: React.FC = () => {
  const rifts = useFetch(api.getRift)

  return (
    <div className="space-y-2">
      <FetchedList result={rifts} emptyLabel="No rift tracks on record.">
        {list =>
          list.map((track: Rift) => (
            <CollapsibleSection key={track.id} title={track.id} meta={`${track.tiers} tiers`} defaultOpen={false}>
              <div className="max-h-96 overflow-auto divide-y divide-white/5">
                {track.rewards.map(tier => (
                  <div key={tier.tier} className="flex items-start gap-3 px-4 py-3">
                    <span className="w-10 text-xs text-faint font-mono shrink-0">#{tier.tier}</span>
                    <div className="flex-1 min-w-0 text-xs font-mono text-tertiary space-y-0.5">
                      {tier.freeItemIds.length > 0 && <div>Free: {tier.freeItemIds.join(', ')}</div>}
                      {tier.premiumItemIds.length > 0 && (
                        <div className="text-secondary">Premium: {tier.premiumItemIds.join(', ')}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          ))
        }
      </FetchedList>
    </div>
  )
}
