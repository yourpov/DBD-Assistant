import { invoke } from '@tauri-apps/api/core'
import type { GameInfo } from './types'

export const getGameInfo = async (): Promise<GameInfo> => {
  return await invoke('game_info')
}

export const startGame = async (): Promise<void> => {
  return await invoke('start_game')
}

export const closeGame = async (): Promise<void> => {
  return await invoke('close_game')
}

export const restartGame = async (): Promise<void> => {
  return await invoke('restart_game')
}
