import React, { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { formatDate } from '../../../lib/format'
import * as api from '../api'
import type { PlayerFullStats } from '../types'
import { BloodpointsPill, Pill } from './TabPrimitives'

const SURVIVOR_DETAIL_ROWS: Array<[string, (s: PlayerFullStats) => number]> = [
  ['Exit gates opened', s => s.exitGatesOpened],
  ['Hex Totems Cleansed', s => s.hexTotemsCleansed],
  ['Chests Searched', s => s.chestsSearched],
  ['Unhooked yourself', s => s.unhookedSelf],
  ['Protection hits for unhooked survivor', s => s.protectionHits],
]

const KILLER_DETAIL_ROWS: Array<[string, (s: PlayerFullStats) => number]> = [
  ['Survivors grabbed while repairing a gen', s => s.survivorsGrabbedFromGen],
  ['Basement party (3+)', s => s.basementParties],
  ['Sacrificed before last generator', s => s.sacrificedBeforeLastGen],
  ['Killed or sacrificed after last generator', s => s.killedOrSacrificedAfterLastGen],
  ['Hatches Closed', s => s.hatchesClosed],
]

const MINUTES_PER_HOUR = 60

const DetailColumn: React.FC<{ title: string; rows: Array<[string, (s: PlayerFullStats) => number]>; stats: PlayerFullStats }> = ({
  title,
  rows,
  stats,
}) => (
  <div>
    <div className="text-xs font-semibold text-secondary mb-2">{title}</div>
    <div className="space-y-1.5">
      {rows.map(([label, read]) => (
        <div key={label} className="flex items-center justify-between gap-3 text-xs">
          <span className="text-ghost">{label}</span>
          <span className="text-strong font-mono shrink-0">{read(stats).toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
)

const StatsBody: React.FC<{ stats: PlayerFullStats }> = ({ stats }) => (
  <>
    <div className="flex flex-wrap gap-1.5 mb-4">
      <BloodpointsPill label="Bloodpoints" value={stats.bloodpoints.toLocaleString()} />
      <Pill label="Escaped" value={stats.escaped.toLocaleString()} />
      <Pill label="Saved" value={stats.survivorsSaved.toLocaleString()} />
      <Pill label="Killed" value={stats.survivorsKilled.toLocaleString()} />
      <Pill label="Sacrificed" value={stats.survivorsSacrificed.toLocaleString()} />
      <Pill label="Skill Checks" value={stats.skillChecks.toLocaleString()} />
      <Pill label="Gens Repaired" value={stats.generatorsRepaired.toLocaleString()} />
      <Pill label="Healed" value={stats.survivorsHealed.toLocaleString()} />
      <Pill label="Hatch Escapes" value={stats.hatchEscapes.toLocaleString()} />
      <Pill label="Survivor Perfect Games" value={stats.survivorPerfectGames.toLocaleString()} />
      <Pill label="Killer Perfect Games" value={stats.killerPerfectGames.toLocaleString()} />
      <Pill label="Playtime" value={`${Math.round(stats.playtimeMinutes / MINUTES_PER_HOUR).toLocaleString()}h`} />
      <Pill label="Survivor Grade" value={stats.survivorGrade.toString()} />
      <Pill label="Killer Grade" value={stats.killerGrade.toString()} />
    </div>
    <div className="grid grid-cols-2 gap-6">
      <DetailColumn title="Survivor Stats" rows={SURVIVOR_DETAIL_ROWS} stats={stats} />
      <DetailColumn title="Killer Stats" rows={KILLER_DETAIL_ROWS} stats={stats} />
    </div>
    {(stats.updatedAtUnix > 0 || stats.createdAtUnix > 0) && (
      <p className="text-[11px] text-ghost mt-4">
        {stats.createdAtUnix > 0 && <>First tracked {formatDate(stats.createdAtUnix)}. </>}
        {stats.updatedAtUnix > 0 && <>Last updated {formatDate(stats.updatedAtUnix)}.</>}
      </p>
    )}
  </>
)

export const PlayerDetailPanel: React.FC<{ steamId: string; autoOpen?: boolean }> = ({ steamId, autoOpen = false }) => {
  const [open, setOpen] = useState(autoOpen)
  const [stats, setStats] = useState<PlayerFullStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadedSteamId = useRef<string | null>(null)

  useEffect(() => {
    if (!open || loadedSteamId.current === steamId) return
    loadedSteamId.current = steamId

    let cancelled = false
    setStats(null)
    setError(null)
    setLoading(true)
    api
      .getPlayerFullStats(steamId)
      .then(result => {
        if (cancelled) return
        if (result) setStats(result)
        else setError('No detailed stats available for this Steam ID.')
      })
      .catch(err => {
        if (!cancelled) setError(String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, steamId])

  return (
    <div className={autoOpen ? '' : 'mt-3'}>
      {!autoOpen && (
        <button
          onClick={() => setOpen(wasOpen => !wasOpen)}
          className="text-xs text-primary-bright hover:text-white underline underline-offset-2 cursor-pointer"
        >
          {open ? 'Hide full stats' : 'View full stats'}
        </button>
      )}
      {open && (
        <div className={autoOpen ? 'panel rounded-lg p-4' : 'mt-3 panel rounded-lg p-4'}>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="w-4 h-4 text-faint animate-spin" />
            </div>
          ) : error ? (
            <p className="text-xs text-red-400/80">{error}</p>
          ) : stats ? (
            <StatsBody stats={stats} />
          ) : null}
        </div>
      )}
    </div>
  )
}

export default PlayerDetailPanel
