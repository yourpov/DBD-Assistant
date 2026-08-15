const MS_PER_SECOND = 1000
const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 1440

export const formatDate = (unixSeconds: number): string =>
  new Date(unixSeconds * MS_PER_SECOND).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

export const formatNumericString = (value: string): string => {
  if (!/^\d+$/.test(value)) return value
  return Number(value).toLocaleString()
}

export function formatCountdown(endUnix: number, nowMs: number): string {
  const remainingMs = endUnix * MS_PER_SECOND - nowMs
  if (remainingMs <= 0) return 'Resetting...'

  const totalMinutes = Math.floor(remainingMs / MS_PER_MINUTE)
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY)
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR)
  const minutes = totalMinutes % MINUTES_PER_HOUR

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
