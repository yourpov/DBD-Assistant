import { invoke } from '@tauri-apps/api/core'
import type { Region } from './types'

export const listRegions = async (): Promise<Region[]> => {
  return await invoke('list_regions')
}

export const setBlockedRegions = async (codes: string[]): Promise<void> => {
  return await invoke('set_blocked_regions', { codes })
}
