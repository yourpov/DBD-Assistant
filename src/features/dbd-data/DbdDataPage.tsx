import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'

import FieldSelect from '../../components/FieldSelect'
import ToastStack from '../../components/ToastStack'
import Tooltip from '../../components/Tooltip'
import { useToasts } from '../../lib/useToasts'
import * as api from './api'
import type { PatchNotes, ShrineRotation } from './types'
import BloodwebOddsTab from './tabs/BloodwebOddsTab'
import CatalogTab from './tabs/CatalogTab'
import LeaderboardTab from './tabs/LeaderboardTab'
import OverviewTab from './tabs/OverviewTab'
import { ArchivesTab, JournalsTab, RiftTab } from './tabs/CollectionTabs'
import { DlcTab, GameModesTab, LiveStatusTab, PatchNotesTab } from './tabs/LiveTabs'
import { characterMetaTags, mapMetaTags } from './gameMetadata'
import { findAddonIcon, findCharacterIcon, findItemIcon, findOfferingIcon } from './mediaIcons'

const COUNTDOWN_TICK_MS = 60_000
const MAX_INLINE_TABS = 4

type TabId =
  | 'overview'
  | 'patch-notes'
  | 'gamemodes'
  | 'live-status'
  | 'leaderboard'
  | 'dlc'
  | 'bloodweb-odds'
  | 'characters'
  | 'perks'
  | 'maps'
  | 'offerings'
  | 'items'
  | 'addons'
  | 'archives'
  | 'journals'
  | 'rift'

interface DataSource {
  label: string
  url: string
}

const TRICKY: DataSource = { label: 'dbd.tricky.lol', url: 'https://dbd.tricky.lol' }
const EIGENVOID: DataSource = {
  label: 'eigenvoid.dev',
  url: 'https://eigenvoid.dev/projects/dead-by-daylight-bloodweb-data',
}

interface TabCategory {
  id: string
  label: string
  tabs: Array<{ value: TabId; label: string }>
  source: DataSource
}

const CATEGORIES: TabCategory[] = [
  { id: 'overview', label: 'Overview', tabs: [{ value: 'overview', label: 'Overview' }], source: TRICKY },
  {
    id: 'live',
    label: 'Live',
    tabs: [
      { value: 'patch-notes', label: 'Patch Notes' },
      { value: 'gamemodes', label: 'Game Modes' },
      { value: 'live-status', label: 'Live Status' },
      { value: 'dlc', label: 'DLC' },
    ],
    source: TRICKY,
  },
  { id: 'leaderboard', label: 'Leaderboard', tabs: [{ value: 'leaderboard', label: 'Leaderboard' }], source: TRICKY },
  {
    id: 'database',
    label: 'Database',
    tabs: [
      { value: 'characters', label: 'Characters' },
      { value: 'perks', label: 'Perks' },
      { value: 'maps', label: 'Maps' },
      { value: 'offerings', label: 'Offerings' },
      { value: 'items', label: 'Items' },
      { value: 'addons', label: 'Add-ons' },
      { value: 'archives', label: 'Archives' },
      { value: 'journals', label: 'Journals' },
      { value: 'rift', label: 'Rift' },
    ],
    source: TRICKY,
  },
  { id: 'tools', label: 'Tools', tabs: [{ value: 'bloodweb-odds', label: 'Bloodweb Odds' }], source: EIGENVOID },
]

const TAB_VIEWS: Record<Exclude<TabId, 'overview'>, React.ReactNode> = {
  'patch-notes': <PatchNotesTab />,
  gamemodes: <GameModesTab />,
  'live-status': <LiveStatusTab />,
  leaderboard: <LeaderboardTab />,
  dlc: <DlcTab />,
  'bloodweb-odds': <BloodwebOddsTab />,
  characters: (
    <CatalogTab
      fetchFn={api.getCharacters}
      searchPlaceholder="Search characters..."
      emptyLabel="No characters found."
      iconFor={findCharacterIcon}
      extraTags={characterMetaTags}
    />
  ),
  perks: <CatalogTab fetchFn={api.getPerks} searchPlaceholder="Search perks..." emptyLabel="No perks found." />,
  maps: (
    <CatalogTab
      fetchFn={api.getMaps}
      searchPlaceholder="Search maps..."
      emptyLabel="No maps found."
      extraTags={mapMetaTags}
    />
  ),
  offerings: (
    <CatalogTab
      fetchFn={api.getOfferings}
      searchPlaceholder="Search offerings..."
      emptyLabel="No offerings found."
      iconFor={findOfferingIcon}
    />
  ),
  items: (
    <CatalogTab
      fetchFn={api.getItems}
      searchPlaceholder="Search items..."
      emptyLabel="No items found."
      iconFor={findItemIcon}
    />
  ),
  addons: (
    <CatalogTab
      fetchFn={api.getAddons}
      searchPlaceholder="Search add-ons..."
      emptyLabel="No add-ons found."
      iconFor={findAddonIcon}
    />
  ),
  archives: <ArchivesTab />,
  journals: <JournalsTab />,
  rift: <RiftTab />,
}

function findCategory(tab: TabId): TabCategory {
  return CATEGORIES.find(cat => cat.tabs.some(t => t.value === tab)) ?? CATEGORIES[0]
}

const DbdDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [shrine, setShrine] = useState<ShrineRotation | null>(null)
  const [patchNotes, setPatchNotes] = useState<PatchNotes | null>(null)
  const [playerCount, setPlayerCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const { toasts, addToast, dismissToast } = useToasts()

  const refresh = async () => {
    setLoading(true)
    const [shrineResult, patchResult, countResult] = await Promise.allSettled([
      api.getShrine(),
      api.getLatestPatchNotes(),
      api.getPlayerCount(),
    ])

    if (shrineResult.status === 'fulfilled') setShrine(shrineResult.value)
    else addToast(`Couldn't load the Shrine of Secrets: ${shrineResult.reason}`, 'error')

    if (patchResult.status === 'fulfilled') setPatchNotes(patchResult.value)
    else addToast(`Couldn't load patch notes: ${patchResult.reason}`, 'error')

    if (countResult.status === 'fulfilled') setPlayerCount(countResult.value)
    else addToast(`Couldn't load the player count: ${countResult.reason}`, 'error')

    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), COUNTDOWN_TICK_MS)
    return () => clearInterval(interval)
  }, [])

  const activeCategory = findCategory(activeTab)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-6 pt-6 pb-4">
        <div className="max-w-4xl mx-auto flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-[3px] text-faint mb-1.5">Dead by Daylight Data</div>
            <div className="text-2xl font-semibold tracking-tight mb-1.5">Live Game Info</div>
            <p className="text-muted text-sm">
              Source:{' '}
              <button
                onClick={() => openUrl(activeCategory.source.url)}
                className="text-primary-bright hover:text-white underline underline-offset-2 cursor-pointer"
              >
                {activeCategory.source.label}
              </button>
            </p>
          </div>
          {activeTab === 'overview' && (
            <Tooltip label="Reload everything">
              <button onClick={refresh} disabled={loading} className="app-btn app-btn-ghost rounded-lg">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="shrink-0 border-b border-white/5 pb-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-black/20 border border-white/10">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.tabs[0].value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  cat.id === activeCategory.id
                    ? 'bg-primary/20 text-primary-bright'
                    : 'text-tertiary hover:text-secondary hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {activeCategory.tabs.length > 1 &&
            (activeCategory.tabs.length <= MAX_INLINE_TABS ? (
              <div className="inline-flex items-center gap-1 flex-wrap">
                {activeCategory.tabs.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                      tab.value === activeTab
                        ? 'bg-white/10 text-strong'
                        : 'text-faint hover:text-tertiary hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="w-52">
                <FieldSelect
                  value={activeTab}
                  options={activeCategory.tabs}
                  onChange={v => setActiveTab(v as TabId)}
                  monospace={false}
                />
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'overview' ? (
            <OverviewTab summary={{ shrine, patchNotes, playerCount, loading, nowMs }} onMessage={addToast} />
          ) : (
            TAB_VIEWS[activeTab]
          )}
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default DbdDataPage
