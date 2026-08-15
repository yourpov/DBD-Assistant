import React, { useState } from 'react'
import { Gift } from 'lucide-react'

import CollapsibleSection from '../../../components/CollapsibleSection'
import FieldSelect from '../../../components/FieldSelect'
import StatChip from '../../../components/StatChip'
import Tooltip from '../../../components/Tooltip'
import {
  BLOODWEB_LEVELS,
  MYSTERY_BOX_ODDS,
  PRESTIGE_MODIFIERS,
  UNLOCKABLE_TYPE_ODDS,
  type CountRange,
  type RingOdds,
} from '../bloodwebData'

const RARITY_COLUMNS: Array<{ key: keyof RingOdds; label: string; color: string }> = [
  { key: 'common', label: 'Common', color: '#a3907c' },
  { key: 'uncommon', label: 'Uncommon', color: '#e0c04c' },
  { key: 'rare', label: 'Rare', color: '#5cb85c' },
  { key: 'veryRare', label: 'Very Rare', color: '#a463d6' },
  { key: 'ultraRare', label: 'Ultra Rare', color: '#e0508c' },
]

const pct = (n: number) => `${n.toFixed(2)}%`

const rangeLabel = ([low, high]: CountRange): string => (low === high ? String(low) : `${low}–${high}`)

const RarityDot: React.FC<{ color: string }> = ({ color }) => (
  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
)

const RarityBar: React.FC<{ odds: RingOdds }> = ({ odds }) => (
  <div className="flex h-1.5 rounded-full overflow-hidden bg-black/30">
    {RARITY_COLUMNS.map(col => {
      const value = odds[col.key]
      if (value <= 0) return null
      return (
        <div key={col.key} style={{ width: `${value}%` }} className="h-full">
          <Tooltip label={`${col.label} ${pct(value)}`}>
            <div className="w-full h-full" style={{ background: col.color }} />
          </Tooltip>
        </div>
      )
    })}
  </div>
)

const RarityLegend: React.FC<{ odds: RingOdds }> = ({ odds }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
    {RARITY_COLUMNS.map(col => (
      <div key={col.key} className="flex items-center gap-1.5 text-[11px]">
        <RarityDot color={col.color} />
        <span className="text-ghost">{col.label}</span>
        <span className="text-tertiary font-mono">{pct(odds[col.key])}</span>
      </div>
    ))}
  </div>
)

const RingRow: React.FC<{ label: string; nodeCount: number; odds: RingOdds }> = ({ label, nodeCount, odds }) => (
  <div className="px-4 py-3">
    <div className="flex items-center justify-between gap-3 mb-1.5">
      <span className="text-sm font-semibold text-strong">{label}</span>
      <span className="text-xs text-faint font-mono">
        {nodeCount} node{nodeCount === 1 ? '' : 's'}
      </span>
    </div>
    <RarityBar odds={odds} />
    <RarityLegend odds={odds} />
  </div>
)

const OddsRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-ghost">{label}</span>
    <span className="font-mono text-tertiary">{pct(value)}</span>
  </div>
)

const LEVEL_OPTIONS = BLOODWEB_LEVELS.map(l => ({ value: String(l.level), label: `Level ${l.level}` }))

const BloodwebOddsTab: React.FC = () => {
  const [levelValue, setLevelValue] = useState('1')
  const level = BLOODWEB_LEVELS.find(l => l.level === Number(levelValue)) ?? BLOODWEB_LEVELS[0]

  return (
    <div className="space-y-3">
      <p className="text-xs text-ghost">
        Item rarity odds by bloodweb ring, per level. Sourced from community reverse-engineering research; assumes no prestige
        modifiers are applied.
      </p>

      <div className="w-40">
        <FieldSelect value={levelValue} options={LEVEL_OPTIONS} onChange={setLevelValue} monospace={false} />
      </div>

      <div className="panel rounded-xl px-7 py-6">
        <div className="flex items-center gap-9 flex-wrap">
          {RARITY_COLUMNS.map(col => (
            <StatChip
              key={col.key}
              icon={<RarityDot color={col.color} />}
              label={col.label}
              value={rangeLabel(level.rarityCounts[col.key])}
              monospace
            />
          ))}
          <StatChip
            icon={<Gift size={12} />}
            label="Mystery Boxes"
            value={rangeLabel(level.itemCounts.mysteryBoxes)}
            monospace
          />
        </div>
      </div>

      <div className="panel rounded-xl overflow-hidden divide-y divide-white/5">
        <RingRow label="Inner Ring" nodeCount={level.nodes.inner} odds={level.innerRing} />
        <RingRow label="Middle Ring" nodeCount={level.nodes.middle} odds={level.middleRing} />
        {level.nodes.outer > 0 && <RingRow label="Outer Ring" nodeCount={level.nodes.outer} odds={level.outerRing} />}
      </div>

      <CollapsibleSection title="Unlockable Type Split" meta="Survivor vs. Killer" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-4 px-4 py-4">
          <div>
            <div className="text-xs font-semibold text-secondary mb-2">Survivor</div>
            <div className="space-y-1.5 text-xs">
              <OddsRow label="Offering" value={UNLOCKABLE_TYPE_ODDS.survivor.offering} />
              <OddsRow label="Item" value={UNLOCKABLE_TYPE_ODDS.survivor.item} />
              <OddsRow label="Add-on" value={UNLOCKABLE_TYPE_ODDS.survivor.addon} />
            </div>
            <div className="text-[11px] text-faint mt-3 mb-1">Including Mystery Boxes</div>
            <div className="space-y-1.5 text-xs">
              <OddsRow label="Offering" value={UNLOCKABLE_TYPE_ODDS.survivorWithMysteryBoxes.offering} />
              <OddsRow label="Item" value={UNLOCKABLE_TYPE_ODDS.survivorWithMysteryBoxes.item} />
              <OddsRow label="Add-on" value={UNLOCKABLE_TYPE_ODDS.survivorWithMysteryBoxes.addon} />
              <OddsRow label="Mystery Box" value={UNLOCKABLE_TYPE_ODDS.survivorWithMysteryBoxes.mysteryBox} />
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-secondary mb-2">Killer</div>
            <div className="space-y-1.5 text-xs">
              <OddsRow label="Offering" value={UNLOCKABLE_TYPE_ODDS.killer.offering} />
              <OddsRow label="Add-on" value={UNLOCKABLE_TYPE_ODDS.killer.addon} />
            </div>
            <div className="text-[11px] text-faint mt-3 mb-1">Including Mystery Boxes</div>
            <div className="space-y-1.5 text-xs">
              <OddsRow label="Offering" value={UNLOCKABLE_TYPE_ODDS.killerWithMysteryBoxes.offering} />
              <OddsRow label="Add-on" value={UNLOCKABLE_TYPE_ODDS.killerWithMysteryBoxes.addon} />
              <OddsRow label="Mystery Box" value={UNLOCKABLE_TYPE_ODDS.killerWithMysteryBoxes.mysteryBox} />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Prestige Modifiers" meta="Rarity probability bonus" defaultOpen={false}>
        <div className="px-4 py-3 grid grid-cols-3 gap-2 text-xs text-faint font-semibold uppercase tracking-wider">
          <span>Prestige</span>
          <span>Rare / Very Rare / Ultra Rare</span>
        </div>
        {PRESTIGE_MODIFIERS.map(p => (
          <div key={p.prestige} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-secondary">Prestige {p.prestige}</span>
            <span className="text-xs font-mono text-tertiary">
              +{p.rareBonus.toFixed(0)}% / +{p.veryRareBonus.toFixed(0)}% / +{p.ultraRareBonus.toFixed(0)}%
            </span>
          </div>
        ))}
      </CollapsibleSection>

      <CollapsibleSection title="Mystery Box Contents" meta="Odds by box rarity" defaultOpen={false}>
        {Object.entries(MYSTERY_BOX_ODDS).map(([key, odds]) => (
          <div key={key} className="px-4 py-3">
            <div className="text-sm font-semibold text-strong mb-1.5 capitalize">{key.replace(/([A-Z])/g, ' $1')} Box</div>
            <RarityBar odds={odds} />
            <RarityLegend odds={odds} />
          </div>
        ))}
      </CollapsibleSection>
    </div>
  )
}

export default BloodwebOddsTab
