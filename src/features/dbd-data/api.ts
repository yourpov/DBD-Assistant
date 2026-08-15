import { invoke } from '@tauri-apps/api/core'
import type {
  Archive,
  CatalogEntry,
  DataVersion,
  DlcEntry,
  GameEvent,
  GameMode,
  Journal,
  KillswitchEntry,
  PatchNotes,
  PlayerFullStats,
  PlayerLookup,
  Rift,
  ShrineRotation,
  TopStatEntry,
} from './types'

export const getShrine = async (): Promise<ShrineRotation> => {
  return await invoke('get_shrine')
}

export const getLatestPatchNotes = async (): Promise<PatchNotes> => {
  return await invoke('get_latest_patch_notes')
}

export const getPlayerCount = async (): Promise<number> => {
  return await invoke('get_player_count')
}

export const getPlayerLookup = async (steamId: string): Promise<PlayerLookup> => {
  return await invoke('get_player_lookup', { steamId })
}

export const getPlayerFullStats = async (steamId: string): Promise<PlayerFullStats | null> => {
  return await invoke('get_player_full_stats', { steamId })
}

export const getDlc = async (): Promise<DlcEntry[]> => {
  return await invoke('get_dlc')
}

export const getEvents = async (): Promise<GameEvent[]> => {
  return await invoke('get_events')
}

export const getGamemodes = async (): Promise<GameMode[]> => {
  return await invoke('get_gamemodes')
}

export const getKillswitch = async (): Promise<KillswitchEntry[]> => {
  return await invoke('get_killswitch')
}

export const getDataVersions = async (): Promise<DataVersion[]> => {
  return await invoke('get_data_versions')
}

export const getRankReset = async (): Promise<number> => {
  return await invoke('get_rank_reset')
}

export const getTopStats = async (stat: string): Promise<TopStatEntry[]> => {
  return await invoke('get_top_stats', { stat })
}

export const getCharacters = async (): Promise<CatalogEntry[]> => {
  return await invoke('get_characters')
}

export const getPerks = async (): Promise<CatalogEntry[]> => {
  return await invoke('get_perks')
}

export const getMaps = async (): Promise<CatalogEntry[]> => {
  return await invoke('get_maps')
}

export const getOfferings = async (): Promise<CatalogEntry[]> => {
  return await invoke('get_offerings')
}

export const getItems = async (): Promise<CatalogEntry[]> => {
  return await invoke('get_items')
}

export const getAddons = async (): Promise<CatalogEntry[]> => {
  return await invoke('get_addons')
}

export const getArchives = async (): Promise<Archive[]> => {
  return await invoke('get_archives')
}

export const getJournals = async (): Promise<Journal[]> => {
  return await invoke('get_journals')
}

export const getRift = async (): Promise<Rift[]> => {
  return await invoke('get_rift')
}
