const OFFERINGS = import.meta.glob(
  '/assets/media/Ultimate Dead by Daylight Assets Collection \\(v10.0.2\\)/Offerings/**/*.{png,jpg,jpeg}',
  { eager: true, import: 'default' }
) as Record<string, string>
const ITEMS = import.meta.glob(
  '/assets/media/Ultimate Dead by Daylight Assets Collection \\(v10.0.2\\)/Items and Add-ons/**/*.{png,jpg,jpeg}',
  { eager: true, import: 'default' }
) as Record<string, string>
const ADDONS = import.meta.glob(
  [
    '/assets/media/Ultimate Dead by Daylight Assets Collection \\(v10.0.2\\)/Powers and Add-ons/**/*.{png,jpg,jpeg}',
    '!/assets/media/Ultimate Dead by Daylight Assets Collection \\(v10.0.2\\)/Powers and Add-ons/**/*[#&]*.{png,jpg,jpeg}',
  ],
  { eager: true, import: 'default' }
) as Record<string, string>
const ADEPTS = import.meta.glob(
  '/assets/media/Ultimate Dead by Daylight Assets Collection \\(v10.0.2\\)/Achievements/Adept/**/*.{png,jpg,jpeg}',
  { eager: true, import: 'default' }
) as Record<string, string>
const UI_IMAGES = import.meta.glob(
  '/assets/media/Ultimate Dead by Daylight Assets Collection \\(v10.0.2\\)/Overlay/UI Images/**/*.{png,jpg,jpeg}',
  { eager: true, import: 'default' }
) as Record<string, string>

const normalize = (s: string): string => s.toLowerCase().replace(/^the\s+/, '').replace(/[^a-z0-9]/g, '')

function buildIndex(modules: Record<string, string>, stripPrefix?: RegExp): Map<string, string> {
  const index = new Map<string, string>()
  for (const [path, url] of Object.entries(modules)) {
    const fileName = path.split('/').pop() ?? ''
    let stem = fileName.replace(/\.(png|jpg|jpeg)$/i, '')
    if (stripPrefix) stem = stem.replace(stripPrefix, '')
    index.set(normalize(stem), url)
  }
  return index
}

const offeringIndex = buildIndex(OFFERINGS)
const itemIndex = buildIndex(ITEMS)
const addonIndex = buildIndex(ADDONS)
const adeptIndex = buildIndex(ADEPTS, /^Adept\s+/)

export const bloodpointsIcon = Object.entries(UI_IMAGES).find(([path]) => path.endsWith('/Bloodpoints.png'))?.[1]

function nicknameOrFirstWord(name: string): string {
  const nickname = name.match(/"([^"]+)"/)
  if (nickname) return nickname[1]
  return name.split(' ')[0]
}

function lastWord(name: string): string {
  const parts = name
    .replace(/"[^"]+"/g, '')
    .trim()
    .split(/\s+/)
  return parts[parts.length - 1]
}

export const findOfferingIcon = (name: string): string | undefined => offeringIndex.get(normalize(name))
export const findItemIcon = (name: string): string | undefined => itemIndex.get(normalize(name))
export const findAddonIcon = (name: string): string | undefined => addonIndex.get(normalize(name))

export function findCharacterIcon(name: string): string | undefined {
  return (
    adeptIndex.get(normalize(name)) ??
    adeptIndex.get(normalize(nicknameOrFirstWord(name))) ??
    adeptIndex.get(normalize(lastWord(name)))
  )
}
