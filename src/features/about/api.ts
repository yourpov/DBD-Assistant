import { invoke } from '@tauri-apps/api/core'
import type { AppCredit } from './types'

export const getAppCredit = async (discordUserId: string): Promise<AppCredit> => {
  return await invoke('get_app_credit', { discordUserId })
}
