import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Save } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import Toggle from '../../components/Toggle'
import CollapsibleSection from '../../components/CollapsibleSection'
import ToastStack from '../../components/ToastStack'
import Tooltip from '../../components/Tooltip'
import { useToasts } from '../../lib/useToasts'
import * as api from './api'
import type { Region } from './types'

const STATUS_URL = 'https://deadbyqueue.com'
const SPIN_LAP_MS = 900
const DEGREES_PER_LAP = 360

function groupByArea(regions: Region[]): Array<{ area: string; regions: Region[] }> {
  const groups: Array<{ area: string; regions: Region[] }> = []
  for (const region of regions) {
    const group = groups.find(g => g.area === region.area)
    if (group) group.regions.push(region)
    else groups.push({ area: region.area, regions: [region] })
  }
  return groups
}

const RegionControlPage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([])
  const [pendingBlocked, setPendingBlocked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [spinRotation, setSpinRotation] = useState(0)
  const spinDegrees = useRef(0)
  const { toasts, addToast, dismissToast } = useToasts()

  const refresh = useCallback(async () => {
    setRefreshing(true)
    const lap = () => {
      spinDegrees.current += DEGREES_PER_LAP
      setSpinRotation(spinDegrees.current)
    }
    lap()
    const spinTimer = setInterval(lap, SPIN_LAP_MS)
    try {
      const next = await api.listRegions()
      setRegions(next)
      setPendingBlocked(new Set(next.filter(r => r.blocked).map(r => r.code)))
    } catch (err) {
      addToast(`Couldn't load region status: ${err}`, 'error')
    } finally {
      clearInterval(spinTimer)
      lap()
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const toggleRegion = (code: string, blocked: boolean) => {
    setPendingBlocked(prev => {
      const next = new Set(prev)
      if (blocked) next.add(code)
      else next.delete(code)
      return next
    })
  }

  const appliedBlocked = new Set(regions.filter(r => r.blocked).map(r => r.code))
  const isDirty =
    pendingBlocked.size !== appliedBlocked.size || [...pendingBlocked].some(code => !appliedBlocked.has(code))

  const applyChanges = async () => {
    setApplying(true)
    try {
      await api.setBlockedRegions([...pendingBlocked])
      addToast('Regions updated', 'success')
      await refresh()
    } catch (err) {
      addToast(`Couldn't update regions: ${err}. If you declined the admin prompt, try again and accept it.`, 'error')
    }
    setApplying(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-faint animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs uppercase tracking-[3px] text-faint mb-1">Region Control</div>
        <div className="text-2xl font-semibold tracking-tight mb-1">Matchmaking Regions</div>
        <p className="text-muted text-sm mb-1">Block regions to control matchmaking.</p>
        <p className="text-ghost text-xs mb-4">
          Status:{' '}
          <button
            onClick={() => openUrl(STATUS_URL)}
            className="text-primary-bright hover:text-white underline underline-offset-2 cursor-pointer"
          >
            deadbyqueue.com
          </button>
        </p>
        <div className="flex items-center justify-between mb-3">
          <Tooltip label="Reload region status">
            <button onClick={refresh} disabled={refreshing} className="app-btn app-btn-ghost rounded-lg">
              <motion.span
                className="inline-flex text-white"
                animate={{ rotate: spinRotation }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <RefreshCw size={14} />
              </motion.span>
              Refresh
            </button>
          </Tooltip>
          <Tooltip label="Apply your blocked region changes">
            <button onClick={applyChanges} disabled={!isDirty || applying} className="app-btn app-btn-primary rounded-lg">
              <Save size={14} />
              {applying ? 'Applying…' : 'Apply'}
            </button>
          </Tooltip>
        </div>

        <div className="space-y-3">
          {groupByArea(regions).map(group => {
            const blockedCount = group.regions.filter(r => pendingBlocked.has(r.code)).length
            return (
              <CollapsibleSection
                key={group.area}
                title={group.area}
                meta={blockedCount > 0 ? `${blockedCount} blocked` : `${group.regions.length} regions`}
                dirty={blockedCount > 0}
                defaultOpen={false}
              >
                {group.regions.map(region => (
                  <div key={region.code} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        region.online === null ? 'bg-white/15' : region.online ? 'bg-emerald-400' : 'bg-white/20'
                      }`}
                      title={region.online === null ? 'Status unknown' : region.online ? 'Online' : 'Offline'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-secondary truncate">{region.name}</div>
                      <div className="text-xs text-ghost font-mono">{region.code}</div>
                    </div>
                    <Toggle
                      checked={pendingBlocked.has(region.code)}
                      onChange={blocked => toggleRegion(region.code, blocked)}
                      aria-label={`Block ${region.name}`}
                    />
                  </div>
                ))}
              </CollapsibleSection>
            )
          })}
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default RegionControlPage
