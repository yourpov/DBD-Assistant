export function readStoredValue(key: string, fallback = ''): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch (err) {
    console.error(`Couldn't read "${key}" from local storage:`, err)
    return fallback
  }
}

export function writeStoredValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (err) {
    console.error(`Couldn't save "${key}" to local storage:`, err)
  }
}
