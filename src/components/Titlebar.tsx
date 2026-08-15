import React from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Minus, Square, X } from 'lucide-react'
import dbdFullLogoWhite from '../assets/dbd-full-logo-white.png'
import Tooltip from './Tooltip'

const appWindow = getCurrentWindow()

const Titlebar: React.FC = () => {
  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="flex items-center gap-2 min-w-0" data-tauri-drag-region>
        <img
          src={dbdFullLogoWhite}
          alt="Dead by Daylight"
          className="h-6 select-none pointer-events-none shrink-0"
          draggable={false}
        />
      </div>
      <div className="flex items-center gap-1 no-drag">
        <Tooltip label="Minimize">
          <button className="titlebar-btn" aria-label="Minimize" onClick={() => appWindow.minimize()}>
            <Minus className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip label="Maximize">
          <button className="titlebar-btn" aria-label="Maximize" onClick={() => appWindow.toggleMaximize()}>
            <Square className="w-3 h-3" />
          </button>
        </Tooltip>
        <Tooltip label="Close">
          <button className="titlebar-btn titlebar-btn--close" aria-label="Close" onClick={() => appWindow.close()}>
            <X className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default Titlebar
