export interface ShrinePerk {
  id: string
  name: string
  character: string
  description: string
  bloodpoints: number
  shards: number
}

export interface ShrineRotation {
  perks: ShrinePerk[]
  startUnix: number
  endUnix: number
}

export interface PatchNoteBlock {
  kind: 'heading' | 'listItem' | 'paragraph'
  text: string
}

export interface PatchNotes {
  version: string
  blocks: PatchNoteBlock[]
}

export interface PlayerLookup {
  steamId: string
  bloodpoints: string | null
  bloodpointsRank: string | null
  adepts: string | null
}

export interface PlayerFullStats {
  bloodpoints: number
  escaped: number
  survivorsSaved: number
  survivorsKilled: number
  survivorsSacrificed: number
  skillChecks: number
  generatorsRepaired: number
  survivorsHealed: number
  hatchEscapes: number
  hatchesClosed: number
  survivorPerfectGames: number
  killerPerfectGames: number
  survivorGrade: number
  killerGrade: number
  playtimeMinutes: number
  exitGatesOpened: number
  hexTotemsCleansed: number
  chestsSearched: number
  unhookedSelf: number
  protectionHits: number
  survivorsGrabbedFromGen: number
  basementParties: number
  sacrificedBeforeLastGen: number
  killedOrSacrificedAfterLastGen: number
  updatedAtUnix: number
  createdAtUnix: number
}

export interface DlcEntry {
  id: string
  name: string
  releaseUnix: number
}

export interface GameEvent {
  name: string
  eventType: string
  bonusMultiplier: number
  startUnix: number
  endUnix: number
}

export interface GameMode {
  id: string
  name: string
  limitedTime: boolean
}

export interface KillswitchEntry {
  item: string
  itemType: string
}

export interface DataVersion {
  category: string
  version: string
  lastUpdateUnix: number
}

export interface TopStatEntry {
  steamId: string
  persona: string
  value: number
}

export interface CatalogEntry {
  id: string
  name: string
  tags: string[]
  description: string
}

export interface ArchiveNode {
  name: string
  role: string
  objective: string
}

export interface ArchiveLevel {
  level: number
  nodes: ArchiveNode[]
}

export interface Archive {
  id: string
  name: string
  levels: ArchiveLevel[]
}

export interface JournalEntry {
  title: string
  text: string
}

export interface Journal {
  id: string
  title: string
  entries: JournalEntry[]
}

export interface RiftTier {
  tier: number
  freeItemIds: string[]
  premiumItemIds: string[]
}

export interface Rift {
  id: string
  tiers: number
  rewards: RiftTier[]
}
