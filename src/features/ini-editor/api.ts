import { invoke } from '@tauri-apps/api/core'
import type { GameClient, IniFilesResponse, OpenIniResponse } from './types'

export const loadIniFiles = async (): Promise<IniFilesResponse> => {
  return await invoke('load_ini_files')
}

export const openIni = async (client: GameClient, filename: string): Promise<OpenIniResponse> => {
  return await invoke('open_ini', { client, filename })
}

export const saveSection = async (section: string, updates: Array<[string, string]>): Promise<void> => {
  return await invoke('save_section', { section, updates })
}

export const applyAudioPresets = async (): Promise<void> => {
  return await invoke('apply_audio_presets')
}

export const getConfigPath = async (): Promise<string> => {
  return await invoke('get_config_path')
}
