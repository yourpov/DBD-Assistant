import React, { useState } from 'react'

import FieldSelect from '../../../components/FieldSelect'
import { useFetch } from '../../../lib/useFetch'
import * as api from '../api'
import { bloodpointsIcon } from '../mediaIcons'
import type { TopStatEntry } from '../types'
import PlayerDetailPanel from './PlayerDetailPanel'
import { EmptyState, ErrorState, LoadingState } from './TabPrimitives'

const LEADERBOARD_STATS: Array<{ value: string; label: string; unit: string }> = [
  { value: 'bloodpoints', label: 'Bloodpoints', unit: 'BP' },
  { value: 'escaped', label: 'Escapes', unit: '' },
  { value: 'killed', label: 'Kills', unit: '' },
  { value: 'sacrificed', label: 'Sacrifices', unit: '' },
  { value: 'saved', label: 'Survivors Saved', unit: '' },
  { value: 'skillchecks', label: 'Skill Checks', unit: '' },
  { value: 'gensrepaired', label: 'Generators Repaired', unit: '' },
  { value: 'survivorshealed', label: 'Survivors Healed', unit: '' },
  { value: 'hatchesclosed', label: 'Hatches Closed', unit: '' },
]

const BLOODPOINTS_STAT = 'bloodpoints'

export const LeaderboardTab: React.FC = () => {
  const [stat, setStat] = useState(BLOODPOINTS_STAT)
  const [expandedSteamId, setExpandedSteamId] = useState<string | null>(null)
  const { data, error } = useFetch(() => api.getTopStats(stat), [stat])

  const changeStat = (next: string) => {
    setExpandedSteamId(null)
    setStat(next)
  }

  const unit = LEADERBOARD_STATS.find(s => s.value === stat)?.unit ?? ''

  return (
    <div>
      <div className="w-56 mb-3">
        <FieldSelect value={stat} options={LEADERBOARD_STATS} onChange={changeStat} monospace={false} />
      </div>
      <p className="text-xs text-ghost mb-3">Top players per category, as ranked by dbd.tricky.lol.</p>
      {error ? (
        <ErrorState message={error} />
      ) : !data ? (
        <LoadingState />
      ) : data.length === 0 ? (
        <EmptyState label="No leaderboard data available." />
      ) : (
        <div className="panel rounded-xl overflow-hidden divide-y divide-white/5">
          {data.map((entry: TopStatEntry, i: number) => (
            <LeaderboardRow
              key={entry.steamId}
              entry={entry}
              rank={i + 1}
              unit={unit}
              showBloodpointsIcon={stat === BLOODPOINTS_STAT}
              expanded={expandedSteamId === entry.steamId}
              onToggle={() => setExpandedSteamId(prev => (prev === entry.steamId ? null : entry.steamId))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface LeaderboardRowProps {
  entry: TopStatEntry
  rank: number
  unit: string
  showBloodpointsIcon: boolean
  expanded: boolean
  onToggle: () => void
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, rank, unit, showBloodpointsIcon, expanded, onToggle }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] text-left"
    >
      <span className="w-6 text-xs text-faint font-mono shrink-0">#{rank}</span>
      <span className="text-sm text-secondary truncate flex-1 min-w-0">{entry.persona}</span>
      <span className="text-sm font-mono text-strong shrink-0 flex items-center gap-1.5">
        {entry.value.toLocaleString()}
        {showBloodpointsIcon && bloodpointsIcon ? (
          <img src={bloodpointsIcon} alt="BP" className="w-3.5 h-3.5" />
        ) : (
          unit
        )}
      </span>
    </button>
    {expanded && (
      <div className="px-4 pb-4">
        <PlayerDetailPanel steamId={entry.steamId} autoOpen />
      </div>
    )}
  </div>
)

export default LeaderboardTab
