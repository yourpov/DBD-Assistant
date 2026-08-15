import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import BackgroundAurora from './BackgroundAurora'
import { prefersReducedMotion } from '../lib/prefersReducedMotion'
import dbdLogoWhite from '../assets/dbd-logo-white.png'

interface Step {
  label: string
  progress: number
}

const STEPS: Step[] = [
  { label: 'Loading modules…', progress: 0.35 },
  { label: 'Preparing workspace…', progress: 0.75 },
  { label: 'Ready', progress: 1 },
]
const STEP_INTERVAL_MS = 320
const MIN_VISIBLE_MS = 1400
const SKIP_AFTER_MS = 600
const FADE_MS = 320

interface Props {
  onFinished: () => void
}

const SplashScreen: React.FC<Props> = ({ onFinished }) => {
  const [stepIndex, setStepIndex] = useState(0)
  const [canSkip, setCanSkip] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const [closing, setClosing] = useState(false)
  const reduceMotion = prefersReducedMotion()

  const finish = useCallback(() => {
    setClosing(true)
    setTimeout(onFinished, reduceMotion ? 0 : FADE_MS)
  }, [onFinished, reduceMotion])

  useEffect(() => {
    if (reduceMotion) {
      setMinElapsed(true)
      setCanSkip(true)
      return
    }
    const skipT = setTimeout(() => setCanSkip(true), SKIP_AFTER_MS)
    const minT = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS)
    return () => {
      clearTimeout(skipT)
      clearTimeout(minT)
    }
  }, [reduceMotion])

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) return
    const t = setTimeout(() => setStepIndex(i => i + 1), STEP_INTERVAL_MS)
    return () => clearTimeout(t)
  }, [stepIndex])

  useEffect(() => {
    const ready = stepIndex === STEPS.length - 1
    if (ready && minElapsed && !closing) finish()
  }, [stepIndex, minElapsed, closing, finish])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canSkip || closing) return
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        finish()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canSkip, closing, finish])

  const step = STEPS[stepIndex]

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: 'var(--color-bg)' }}
      initial={false}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: reduceMotion ? 0 : FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => canSkip && finish()}
      role="status"
      aria-label="Loading DBD Assistant"
      aria-busy={!closing}
    >
      <BackgroundAurora playing={!reduceMotion && !closing} />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={dbdLogoWhite} alt="Dead by Daylight" className="w-56 select-none pointer-events-none" draggable={false} />

        <div
          className="relative left-1/2 w-screen h-px -translate-x-1/2 my-2"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 20%, rgba(255,255,255,0.35) 80%, transparent)',
            boxShadow: '0 8px 16px -4px rgba(255,255,255,0.06)',
          }}
        />

        {reduceMotion ? (
          <h1 className="text-4xl font-semibold tracking-wide text-white">
            Assistant
          </h1>
        ) : (
          <div className="relative">
            <h1 className="text-4xl font-semibold tracking-wide text-white/[0.05] blur-[1px]">
              Assistant
            </h1>
            <motion.h1
              className="absolute inset-0 text-4xl font-semibold tracking-wide text-white"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              Assistant
            </motion.h1>
            <motion.div
              className="absolute top-0 bottom-0 w-8 -ml-4 blur-md"
              style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.9), transparent 70%)' }}
              initial={{ left: '0%', opacity: 0 }}
              animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, delay: 0.3, times: [0, 0.15, 0.85, 1], ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute top-0 bottom-0 w-px"
              style={{ background: '#fff', boxShadow: '0 0 10px 2px rgba(255,255,255,0.85)' }}
              initial={{ left: '0%', opacity: 0 }}
              animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.1, delay: 0.3, times: [0, 0.15, 0.85, 1], ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        )}

        <div className="w-[220px] mt-3">
          <div className="splash-progress__track">
            <motion.div
              className="splash-progress__fill"
              initial={false}
              animate={{ width: `${Math.round(step.progress * 100)}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 text-center text-[11px] text-faint">
            {stepIndex === STEPS.length - 1 && canSkip ? 'Press Esc to continue' : step.label}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SplashScreen
