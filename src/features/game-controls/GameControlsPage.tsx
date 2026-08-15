import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, X, RotateCw, RefreshCw, Gamepad2, FolderOpen, Tag, Monitor, Circle, CheckCircle2 } from 'lucide-react'
import { openPath, revealItemInDir } from '@tauri-apps/plugin-opener'

import StatChip from '../../components/StatChip'
import Tooltip from '../../components/Tooltip'
import ToastStack from '../../components/ToastStack'
import { useToasts } from '../../lib/useToasts'
import * as api from './api'
import type { GameInfo } from './types'

const POLL_INTERVAL_MS = 5000
/** How long to let the launcher settle before re-reading the running state. */
const ACTION_SETTLE_MS = 1500

type GameAction = 'start' | 'close' | 'restart'

const ACTIONS: Record<GameAction, { run: () => Promise<void>; label: string }> = {
  start: { run: api.startGame, label: 'Launching Dead by Daylight…' },
  close: { run: api.closeGame, label: 'Closing Dead by Daylight…' },
  restart: { run: api.restartGame, label: 'Restarting Dead by Daylight…' },
}

const GameControlsPage: React.FC = () => {
  const [info, setInfo] = useState<GameInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [busyAction, setBusyAction] = useState<GameAction | null>(null)
  const { toasts, addToast, dismissToast } = useToasts()

  const loadInfo = useCallback(async (onFailure: (err: unknown) => void) => {
    try {
      setInfo(await api.getGameInfo())
    } catch (err) {
      onFailure(err)
    }
  }, [])

  const reportToUser = useCallback(
    (err: unknown) => addToast(`Couldn't read your Dead by Daylight install info: ${err}. Try again in a moment.`, 'error'),
    [addToast]
  )
  const reportToConsole = useCallback((err: unknown) => {
    console.error("Couldn't refresh Dead by Daylight install info:", err)
  }, [])

  useEffect(() => {
    setLoading(true)
    loadInfo(reportToUser).finally(() => setLoading(false))
    const interval = setInterval(() => loadInfo(reportToConsole), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [loadInfo, reportToUser, reportToConsole])

  const runAction = async (action: GameAction) => {
    setBusyAction(action)
    try {
      await ACTIONS[action].run()
      addToast(ACTIONS[action].label, 'success')
      setTimeout(() => loadInfo(reportToConsole), ACTION_SETTLE_MS)
    } catch (err) {
      addToast(`Couldn't ${action} Dead by Daylight: ${err}`, 'error')
    }
    setBusyAction(null)
  }

  const openInstallLocation = async () => {
    if (!info?.installLocation) return
    try {
      await openPath(info.installLocation.replace(/\\/g, '/'))
    } catch (err) {
      addToast(`Couldn't open the install folder: ${err}. Check that it still exists.`, 'error')
    }
  }

  const revealExecutable = async () => {
    if (!info?.executable) return
    try {
      await revealItemInDir(info.executable.replace(/\\/g, '/'))
    } catch (err) {
      addToast(`Couldn't locate the executable: ${err}. Check that it still exists.`, 'error')
    }
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
        <div className="text-xs uppercase tracking-[3px] text-faint mb-1.5">Game Controls</div>
        <div className="text-2xl font-semibold tracking-tight mb-1.5">{info?.displayName ?? 'Dead by Daylight'}</div>
        <p className="text-muted text-sm mb-8">
          {info?.installed ? `Detected via ${info.platform}.` : 'No local install detected.'}
        </p>

        <div className="panel rounded-xl px-7 py-6 mb-6">
          <div className="flex items-center justify-between gap-8 flex-wrap">
            <div className="flex items-center gap-9 flex-wrap">
              <StatChip
                icon={<Circle size={8} className="fill-current" />}
                label="Status"
                value={info?.running ? 'Running' : 'Not running'}
                tone={info?.running ? 'success' : 'default'}
              />
              <StatChip
                icon={<CheckCircle2 size={12} />}
                label="Installed"
                value={info?.installed ? 'Yes' : 'No'}
                tone={info?.installed ? 'success' : 'default'}
              />
              <StatChip icon={<Gamepad2 size={12} />} label="Platform" value={info?.platform ?? 'N/A'} />
              <StatChip icon={<Tag size={12} />} label="Version" value={info?.version ?? 'N/A'} />
            </div>
            <div className="flex items-center gap-2.5 pl-8 border-l border-white/10">
              {info?.running ? (
                <Tooltip label="Force-close Dead by Daylight">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => runAction('close')}
                    disabled={busyAction !== null}
                    className="app-btn app-btn-ghost rounded-lg"
                    style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'rgba(248,113,113,0.85)' }}
                  >
                    <X size={14} />
                    Close Game
                  </motion.button>
                </Tooltip>
              ) : (
                <Tooltip label={info?.platform ? `Launch Dead by Daylight through ${info.platform}` : 'Launch Dead by Daylight'}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => runAction('start')}
                    disabled={busyAction !== null || !info?.installed}
                    className="app-btn app-btn-primary rounded-lg"
                  >
                    <Play size={14} />
                    Start Game
                  </motion.button>
                </Tooltip>
              )}
              <Tooltip label="Close and relaunch">
                <button
                  onClick={() => runAction('restart')}
                  disabled={busyAction !== null || !info?.installed}
                  className="app-btn app-btn-ghost rounded-lg"
                  aria-label="Restart Dead by Daylight"
                >
                  <RotateCw size={14} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {info?.installed && (
          <div className="panel rounded-xl px-7 py-6">
            <div className="text-xs uppercase tracking-widest text-faint mb-5">Install Paths</div>
            <div className="space-y-4">
              <PathRow
                icon={<FolderOpen size={14} />}
                label="Install location"
                value={info.installLocation}
                onOpen={openInstallLocation}
                openLabel="Open install folder"
              />
              <PathRow
                icon={<Monitor size={14} />}
                label="Executable"
                value={info.executable}
                onOpen={revealExecutable}
                openLabel="Show in folder"
              />
            </div>
          </div>
        )}
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

const PathRow: React.FC<{ icon: React.ReactNode; label: string; value: string; onOpen: () => void; openLabel: string }> = ({
  icon,
  label,
  value,
  onOpen,
  openLabel,
}) => (
  <div className="flex items-center gap-3">
    <span className="text-faint shrink-0">{icon}</span>
    <span className="text-xs text-faint w-32 shrink-0">{label}</span>
    <div className="readonly-field font-mono flex-1 min-w-0 truncate">{value}</div>
    <Tooltip label={openLabel}>
      <button onClick={onOpen} aria-label={openLabel} className="app-btn app-btn-ghost rounded-lg shrink-0">
        <FolderOpen size={14} />
      </button>
    </Tooltip>
  </div>
)

export default GameControlsPage
