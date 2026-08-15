export type GameClient = 'windows' | 'egs'

export interface IniSection {
  name: string
  keys: Array<[string, string]>
}

export interface IniFilesResponse {
  windows: string[]
  egs: string[]
}

export interface OpenIniResponse {
  client: GameClient
  filename: string
  sections: IniSection[]
}
