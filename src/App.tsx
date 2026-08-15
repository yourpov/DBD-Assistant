import React, { useState } from 'react'
import Titlebar from './components/Titlebar'
import Sidebar from './components/Sidebar'
import SplashScreen from './components/SplashScreen'
import BackgroundAurora from './components/BackgroundAurora'
import { MODULES } from './lib/modules'

const App: React.FC = () => {
  const [activeId, setActiveId] = useState(MODULES[0].id)
  const [booting, setBooting] = useState(true)
  const ActiveComponent = MODULES.find(m => m.id === activeId)?.Component ?? MODULES[0].Component

  return (
    <div className="h-screen bg-bg text-strong flex flex-col overflow-hidden relative">
      <BackgroundAurora playing={!booting} />
      <Titlebar />
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar modules={MODULES} activeId={activeId} onSelect={setActiveId} />
        <ActiveComponent />
        {booting && <SplashScreen onFinished={() => setBooting(false)} />}
      </div>
    </div>
  )
}

export default App
