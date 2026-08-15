import type { FC } from 'react'
import { FileEdit, Gamepad2, Globe, Database, Info } from 'lucide-react'
import IniEditorPage from '../features/ini-editor/IniEditorPage'
import GameControlsPage from '../features/game-controls/GameControlsPage'
import RegionControlPage from '../features/region-control/RegionControlPage'
import DbdDataPage from '../features/dbd-data/DbdDataPage'
import AboutPage from '../features/about/AboutPage'

export interface AppModule {
  id: string
  label: string
  icon: FC<{ size?: number; className?: string }>
  Component: FC
}

export const MODULES: AppModule[] = [
  { id: 'ini-editor', label: 'INI Editor', icon: FileEdit, Component: IniEditorPage },
  { id: 'game-controls', label: 'Game Controls', icon: Gamepad2, Component: GameControlsPage },
  { id: 'region-control', label: 'Region Control', icon: Globe, Component: RegionControlPage },
  { id: 'dbd-data', label: 'DBD Data', icon: Database, Component: DbdDataPage },
  { id: 'about', label: 'About', icon: Info, Component: AboutPage },
]
