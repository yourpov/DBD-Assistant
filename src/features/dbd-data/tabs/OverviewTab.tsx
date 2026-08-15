import React, { useState } from 'react'
import { Clock, ScrollText, Search, Sparkles, Users } from 'lucide-react'

import StatChip from '../../../components/StatChip'
import Tooltip from '../../../components/Tooltip'
import { formatCountdown, formatNumericString } from '../../../lib/format'
import { readStoredValue, writeStoredValue } from '../../../lib/localStorage'
import * as api from '../api'
import { bloodpointsIcon } from '../mediaIcons'
import type { PatchNotes, PlayerLookup, ShrineRotation } from '../types'
import PlayerDetailPanel from './PlayerDetailPanel'
import { BloodpointsPill, Pill } from './TabPrimitives'

const STEAM_ID_KEY = 'dbd-assistant.steamId'

export interface OverviewSummary {
  shrine: ShrineRotation | null
  patchNotes: PatchNotes | null
  playerCount: number | null
  loading: boolean
  nowMs: number
}

interface Props {
  summary: OverviewSummary
  onMessage: (message: string, type: 'error' | 'info') => void
}

export const OverviewTab: React.FC<Props> = ({ summary, onMessage }) => {
  const { shrine, patchNotes, playerCount, loading, nowMs } = summary

  return (
    <>
      <div className="flex items-center gap-9 mb-6 panel rounded-xl px-7 py-6 flex-wrap">
        <StatChip
          icon={<Users size={12} />}
          label="Players Online (Steam)"
          value={playerCount !== null ? playerCount.toLocaleString() : 'N/A'}
        />
        <StatChip
          icon={<Clock size={12} />}
          label="Shrine Resets"
          value={shrine ? formatCountdown(shrine.endUnix, nowMs) : 'N/A'}
        />
        <StatChip icon={<ScrollText size={12} />} label="Latest Version" value={patchNotes?.version ?? 'N/A'} />
      </div>

      <ShrinePanel shrine={shrine} loading={loading} />
      <PlayerLookupPanel onMessage={onMessage} />
    </>
  )
}

const ShrinePanel: React.FC<{ shrine: ShrineRotation | null; loading: boolean }> = ({ shrine, loading }) => (
  <div className="panel rounded-xl px-7 py-6 mb-6">
    <div className="flex items-center gap-2 mb-5">
      <Sparkles size={15} className="text-primary-bright" />
      <span className="text-sm font-semibold text-secondary">Shrine of Secrets</span>
    </div>
    {shrine ? (
      <div className="panel rounded-xl overflow-hidden divide-y divide-white/5">
        {shrine.perks.map(perk => (
          <div key={perk.id} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
              <div className="min-w-0">
                <span className="text-sm font-semibold text-strong">{perk.name}</span>
                <span className="text-xs text-ghost ml-2">{perk.character}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Pill label="Shards" value={perk.shards.toLocaleString()} />
                <BloodpointsPill label="BP" value={perk.bloodpoints.toLocaleString()} />
              </div>
            </div>
            <p className="text-xs text-tertiary leading-relaxed">{perk.description}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-ghost">{loading ? 'Loading...' : 'Unavailable right now.'}</p>
    )}
  </div>
)

const LookupField: React.FC<{ label: string; value: string | null; iconSrc?: string }> = ({ label, value, iconSrc }) => (
  <div className="panel rounded-lg p-3 flex items-center gap-2.5">
    {iconSrc && <img src={iconSrc} alt="" className="w-6 h-6 shrink-0" />}
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-faint mb-1">{label}</div>
      <div className="text-sm font-mono text-strong">{value ? formatNumericString(value) : 'Not public'}</div>
    </div>
  </div>
)

const PlayerLookupPanel: React.FC<{ onMessage: Props['onMessage'] }> = ({ onMessage }) => {
  const [steamId, setSteamId] = useState(() => readStoredValue(STEAM_ID_KEY))
  const [lookup, setLookup] = useState<PlayerLookup | null>(null)
  const [lookingUp, setLookingUp] = useState(false)

  const runLookup = async () => {
    const trimmed = steamId.trim()
    if (!trimmed) return

    writeStoredValue(STEAM_ID_KEY, trimmed)
    setLookingUp(true)
    try {
      const result = await api.getPlayerLookup(trimmed)
      setLookup(result)
      if (!result.bloodpoints && !result.bloodpointsRank && !result.adepts) {
        onMessage('No public stats found for that Steam ID.', 'info')
      }
    } catch (err) {
      onMessage(`Couldn't look up that Steam ID: ${err}`, 'error')
    }
    setLookingUp(false)
  }

  return (
    <div className="panel rounded-xl px-7 py-6">
      <div className="text-sm font-semibold text-secondary mb-1">Player Lookup</div>
      <p className="text-xs text-ghost mb-4">Public stats for any Steam ID. Yours is saved on this device only.</p>
      <div className="flex items-center gap-2 mb-4">
        <div className="glow-input flex-1 max-w-xs">
          <input
            value={steamId}
            onChange={e => setSteamId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runLookup()}
            placeholder="Steam ID"
            className="glow-input-field font-mono"
          />
        </div>
        <Tooltip label="Look up this Steam ID">
          <button onClick={runLookup} disabled={lookingUp || !steamId.trim()} className="app-btn app-btn-primary rounded-lg">
            <Search size={14} className={lookingUp ? 'animate-pulse' : ''} />
            Look Up
          </button>
        </Tooltip>
      </div>
      {lookup && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <LookupField label="Bloodpoints" value={lookup.bloodpoints} iconSrc={bloodpointsIcon} />
            <LookupField label="Bloodpoint Rank" value={lookup.bloodpointsRank} />
            <LookupField label="Adepts" value={lookup.adepts} />
          </div>
          <PlayerDetailPanel key={lookup.steamId} steamId={lookup.steamId} />
        </>
      )}
    </div>
  )
}

export default OverviewTab
