import React, { useEffect, useState } from 'react'
import { openUrl } from '@tauri-apps/plugin-opener'
import { Copy, Check, Link as LinkIcon, RefreshCw } from 'lucide-react'

import CollapsibleSection from '../../components/CollapsibleSection'
import Tooltip from '../../components/Tooltip'
import { getAppCredit } from './api'
import type { AppCredit } from './types'
import discordIcon from '../../assets/social/discord.png'
import instagramIcon from '../../assets/social/instagram.png'
import telegramIcon from '../../assets/social/telegram.png'

/** The author's Discord account: shown as a link here and looked up for live presence. */
const DISCORD_USER_ID = '1470172610636808425'
const COPY_FEEDBACK_MS = 1500

const SOCIAL_LINKS: Array<{ label: string; url: string; icon: string | null }> = [
  { label: 'Discord', url: `https://discord.com/users/${DISCORD_USER_ID}`, icon: discordIcon },
  { label: 'Telegram', url: 'https://t.me/depoLTC', icon: telegramIcon },
  { label: 'Instagram', url: 'https://instagram.com/runsomefunds', icon: instagramIcon },
  { label: 'Portfolio', url: 'https://yourpov.dev/', icon: null },
]

const SOURCE_URL = 'https://github.com/yourpov/DBD-Assistant/'

const STATUS_COLORS: Record<string, string> = {
  online: '#3ba55d',
  idle: '#f0b232',
  dnd: '#ed4245',
  offline: '#80848e',
}

const AVATAR_SIZE = 56
// Discord's avatar-decoration presets are drawn 1.25x the avatar's diameter, centered on it.
const DECORATION_SIZE = Math.round(AVATAR_SIZE * 1.25)
const DECORATION_OFFSET = (DECORATION_SIZE - AVATAR_SIZE) / 2

const CopyableValue: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    } catch (err) {
      console.error(`Couldn't copy "${value}" to the clipboard:`, err)
    }
  }

  return (
    <Tooltip label={copied ? 'Copied!' : 'Copy'}>
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/30 border border-white/10 text-[11px] font-mono text-tertiary hover:text-strong hover:border-white/20 cursor-pointer"
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {value}
      </button>
    </Tooltip>
  )
}

const CreditBadge: React.FC<{ credit: AppCredit }> = ({ credit }) => (
  <div className="flex items-center gap-3.5">
    <div className="relative shrink-0" style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}>
      <img src={credit.avatarDataUrl} alt="" className="rounded-full" style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />
      {credit.decorationDataUrl && (
        <img
          src={credit.decorationDataUrl}
          alt=""
          className="absolute pointer-events-none"
          style={{ width: DECORATION_SIZE, height: DECORATION_SIZE, top: -DECORATION_OFFSET, left: -DECORATION_OFFSET }}
        />
      )}
      <span
        className="absolute right-0 bottom-0 rounded-full border-2"
        style={{
          width: 14,
          height: 14,
          background: STATUS_COLORS[credit.status] ?? STATUS_COLORS.offline,
          borderColor: 'var(--color-bg)',
        }}
      />
    </div>
    <div className="min-w-0">
      <div className="text-sm font-semibold text-strong leading-tight">{credit.displayName}</div>
      <div className="text-xs text-faint truncate mt-1">{credit.activityText ?? `@${credit.username}`}</div>
    </div>
  </div>
)

interface TransparencySection {
  title: string
  items: React.ReactNode[]
}

const TRANSPARENCY_SECTIONS: TransparencySection[] = [
  {
    title: 'Files the app can access',
    items: [
      <>
        Dead by Daylight configuration files for the INI Editor and presets:
        <CopyableValue value="%LOCALAPPDATA%\DeadByDaylight\Saved\Config\" />
      </>,
      <>
        The Windows hosts file for Region Control (requires admin):
        <CopyableValue value="%SystemRoot%\System32\drivers\etc\hosts" />
      </>,
    ],
  },
]

const AboutPage: React.FC = () => {
  const [credit, setCredit] = useState<AppCredit | null>(null)
  const [loading, setLoading] = useState(true)

  const loadCredit = () => {
    setLoading(true)
    getAppCredit(DISCORD_USER_ID)
      .then(setCredit)
      .catch(err => {
        setCredit(null)
        console.error("Couldn't load the Discord presence for the credits panel:", err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCredit()
  }, [])

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[3px] text-faint mb-1.5">About</div>
          <div className="text-2xl font-semibold tracking-tight mb-1.5">DBD Assistant</div>
          <p className="text-muted text-sm">Version {__APP_VERSION__}</p>
        </div>

        <div className="panel rounded-xl px-7 py-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <span className="text-sm font-semibold text-secondary">Credits</span>
            <Tooltip label="Refresh Discord presence">
              <button onClick={loadCredit} disabled={loading} className="app-btn app-btn-ghost rounded-lg">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            {credit ? (
              <CreditBadge credit={credit} />
            ) : loading ? (
              <div className="flex items-center gap-2 text-sm text-faint" style={{ height: AVATAR_SIZE }}>
                <RefreshCw size={13} className="animate-spin" /> Loading presence...
              </div>
            ) : (
              <div className="flex items-center gap-3.5" style={{ height: AVATAR_SIZE }}>
                <div
                  className="rounded-full bg-white/5 flex items-center justify-center text-base font-bold text-tertiary shrink-0"
                  style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                >
                  P
                </div>
                <div className="text-sm font-semibold text-strong">Pov</div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(link => (
                <Tooltip key={link.label} label={link.label}>
                  <button
                    onClick={() => openUrl(link.url)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                  >
                    {link.icon ? (
                      <img src={link.icon} alt={link.label} className="w-4 h-4 object-contain" />
                    ) : (
                      <LinkIcon size={16} className="text-tertiary" />
                    )}
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {TRANSPARENCY_SECTIONS.map(section => (
            <CollapsibleSection key={section.title} title={section.title} defaultOpen>
              {section.items.map((item, i) => (
                <div key={i} className="px-4 py-3 text-xs text-tertiary leading-relaxed">
                  {item}
                </div>
              ))}
            </CollapsibleSection>
          ))}
        </div>

        <p className="text-[11px] text-ghost mt-4">
          <button
            onClick={() => openUrl(SOURCE_URL)}
            title={SOURCE_URL}
            className="text-primary-bright hover:text-white underline underline-offset-2 cursor-pointer"
          >
            Open source on GitHub
          </button>
        </p>
      </div>
    </div>
  )
}

export default AboutPage
