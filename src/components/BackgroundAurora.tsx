import { useEffect, useRef, useState } from 'react'
import { BACKGROUND_ART } from '../lib/backgroundArt'
import { prefersReducedMotion } from '../lib/prefersReducedMotion'

interface Props {
  playing?: boolean
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const ART_INTERVAL_MS = 16000

function useArtCycle(playing: boolean, reducedMotion: boolean) {
  const [order] = useState(() => shuffled(BACKGROUND_ART))
  const posRef = useRef(0)
  const [slots, setSlots] = useState<[string, string]>([order[0], order[1] ?? order[0]])
  const [front, setFront] = useState<0 | 1>(0)

  useEffect(() => {
    if (!playing || reducedMotion || order.length < 2) return
    const interval = setInterval(() => {
      posRef.current = (posRef.current + 1) % order.length
      setFront(prevFront => {
        const back = prevFront === 0 ? 1 : 0
        setSlots(prevSlots => {
          const next: [string, string] = [...prevSlots]
          next[back] = order[posRef.current]
          return next
        })
        return back
      })
    }, ART_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [playing, reducedMotion, order])

  return { slots, front }
}

type Rgb = { r: number; g: number; b: number }

const ORB_COLORS: Rgb[] = [
  { r: 93, g: 134, b: 171 },
  { r: 68, g: 94, b: 122 },
  { r: 125, g: 166, b: 205 },
  { r: 40, g: 58, b: 76 },
  { r: 245, g: 245, b: 247 },
]

interface Orb {
  x: number
  y: number
  radius: number
  phase: number
  driftX: number
  driftY: number
  sprite: HTMLCanvasElement
}

function makeOrbSprite(color: Rgb, alpha: number, radius: number): HTMLCanvasElement {
  const size = Math.max(4, Math.ceil(radius * 2))
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const ctx = sprite.getContext('2d')
  if (!ctx) return sprite
  const half = size / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  const { r, g, b } = color
  gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
  gradient.addColorStop(0.45, `rgba(${r},${g},${b},${alpha * 0.35})`)
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return sprite
}

const ORB_COUNT = 10
const FRAME_INTERVAL_MS = 33
const MAX_DEVICE_PIXEL_RATIO = 2

function createOrbs(width: number, height: number): Orb[] {
  const scale = Math.min(width, height)
  return Array.from({ length: ORB_COUNT }, (_, index) => {
    const color = ORB_COLORS[index % ORB_COLORS.length]
    const radius = scale * (0.08 + Math.random() * 0.1)
    const isAccent = color.g > 150
    const alpha = isAccent ? 0.16 + Math.random() * 0.1 : 0.06 + Math.random() * 0.06
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius,
      phase: Math.random() * Math.PI * 2,
      driftX: 0.35 + Math.random() * 0.35,
      driftY: 0.3 + Math.random() * 0.3,
      sprite: makeOrbSprite(color, alpha, radius),
    }
  })
}

function drawOrbs(ctx: CanvasRenderingContext2D, orbs: Orb[], width: number, height: number, time: number) {
  ctx.clearRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'lighter'

  const t = time * 0.001

  for (const orb of orbs) {
    const x =
      orb.x +
      Math.sin(t * 0.72 + orb.phase) * width * orb.driftX * 0.24 +
      Math.cos(t * 0.52 + orb.phase * 1.4) * width * 0.15
    const y =
      orb.y +
      Math.cos(t * 0.65 + orb.phase * 0.8) * height * orb.driftY * 0.22 +
      Math.sin(t * 0.48 + orb.phase * 1.1) * height * 0.13

    const pulse = 1 + Math.sin(t * 0.9 + orb.phase) * 0.14
    const size = orb.radius * pulse * 2

    ctx.drawImage(orb.sprite, x - size / 2, y - size / 2, size, size)
  }
}

export function BackgroundAurora({ playing = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbsRef = useRef<Orb[]>([])
  const frameRef = useRef<number | null>(null)
  const reducedMotion = prefersReducedMotion()
  const { slots: artSlots, front: artFront } = useArtCycle(playing, reducedMotion)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !playing || reducedMotion) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
      const width = parent.clientWidth
      const height = parent.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      orbsRef.current = createOrbs(width, height)
      drawOrbs(ctx, orbsRef.current, width, height, performance.now())
    }

    let lastDrawAt = 0
    const tick = (time: number) => {
      if (time - lastDrawAt >= FRAME_INTERVAL_MS) {
        lastDrawAt = time
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        if (width > 0 && height > 0) {
          drawOrbs(ctx, orbsRef.current, width, height, time)
        }
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    resize()
    frameRef.current = requestAnimationFrame(tick)
    const observer = new ResizeObserver(resize)
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    return () => {
      observer.disconnect()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [playing, reducedMotion])

  return (
    <div className="app-backdrop" aria-hidden>
      <div className="app-backdrop-base" />
      {playing && !reducedMotion && (
        <div className="app-backdrop-art">
          {artSlots.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="app-backdrop-art-layer"
              style={{ opacity: i === artFront ? 0.16 : 0 }}
            />
          ))}
        </div>
      )}
      <div className="app-backdrop-vignette" />
      {playing ? <canvas ref={canvasRef} className="app-backdrop-canvas" /> : null}
      <div className="app-backdrop-scrim" />
    </div>
  )
}

export default BackgroundAurora
