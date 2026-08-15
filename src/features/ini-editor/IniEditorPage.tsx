import React, { useState, useEffect } from 'react'
import { Folder, FolderOpen, Save, RefreshCw, Settings, FileText, RotateCcw } from 'lucide-react'
import { revealItemInDir } from '@tauri-apps/plugin-opener'

import * as api from './api'
import ToastStack from '../../components/ToastStack'
import FieldSelect from '../../components/FieldSelect'
import CollapsibleSection from '../../components/CollapsibleSection'
import Tooltip from '../../components/Tooltip'
import { useToasts } from '../../lib/useToasts'
import { KEY_DESCRIPTIONS, fieldSpecFor } from './keyInfo'
import type { GameClient, IniFilesResponse, OpenIniResponse } from './types'

const NO_FILES: IniFilesResponse = { windows: [], egs: [] }
const IN_GAME_SETTINGS_FILE = 'GameUserSettings.ini'

function fileLabel(client: GameClient, filename: string): string {
  return client === 'egs' && filename === IN_GAME_SETTINGS_FILE ? `${filename} (In-Game Settings)` : filename
}

type SectionEdits = Record<string, Record<string, string>>

interface KeyRowProps {
  keyName: string
  currentValue: string
  editedValue: string | undefined
  onChange: (value: string) => void
  onReset: () => void
}

const KeyRow: React.FC<KeyRowProps> = ({ keyName, currentValue, editedValue, onChange, onReset }) => {
  const value = editedValue ?? currentValue
  const description = KEY_DESCRIPTIONS[keyName]
  const spec = fieldSpecFor(keyName, currentValue)
  const recommendedOption = spec.options.find(o => o.recommended)
  const isEdited = editedValue !== undefined

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-secondary truncate">{keyName}</span>
          {recommendedOption && recommendedOption.value !== value && (
            <span className="select-option-badge shrink-0">Recommended: {recommendedOption.label}</span>
          )}
        </div>
        {description && <div className="text-xs text-ghost mt-0.5">{description}</div>}
      </div>
      <div className="w-56 shrink-0 flex items-center gap-2">
        <div className="flex-1">
          {spec.options.length > 0 ? (
            <FieldSelect value={value} options={spec.options} onChange={onChange} defaultValue={currentValue} />
          ) : (
            <div className="readonly-field font-mono" title="No known-safe options for this key">
              {value}
            </div>
          )}
        </div>
        {isEdited && (
          <Tooltip label="Reset to default">
            <button onClick={onReset} className="text-faint hover:text-tertiary cursor-pointer shrink-0">
              <RotateCcw size={14} />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

interface FileTabProps {
  client: GameClient
  filename: string
  active: boolean
  onOpen: () => void
}

const FileTab: React.FC<FileTabProps> = ({ client, filename, active, onOpen }) => (
  <button
    onClick={onOpen}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium -mb-px border-b-2 rounded-t-md transition-all duration-200 cursor-pointer whitespace-nowrap ${
      active
        ? 'text-primary-bright border-primary-bright bg-white/[0.03]'
        : 'text-tertiary border-transparent hover:text-secondary hover:bg-white/5 hover:border-white/10'
    }`}
  >
    <FileText size={15} />
    {fileLabel(client, filename)}
  </button>
)

const IniEditorPage: React.FC = () => {
  const [files, setFiles] = useState<IniFilesResponse>(NO_FILES)
  const [openFile, setOpenFile] = useState<OpenIniResponse | null>(null)
  const [edits, setEdits] = useState<SectionEdits>({})
  const [loading, setLoading] = useState(false)
  const { toasts, addToast, dismissToast } = useToasts()

  const refreshIniFiles = async () => {
    setLoading(true)
    try {
      setFiles(await api.loadIniFiles())
      setOpenFile(null)
      setEdits({})
    } catch (err) {
      addToast(`Couldn't load your DBD config files: ${err}`, 'error')
    }
    setLoading(false)
  }

  const openIni = async (client: GameClient, filename: string) => {
    setLoading(true)
    try {
      setOpenFile(await api.openIni(client, filename))
      setEdits({})
    } catch (err) {
      addToast(`Couldn't load ${filename}: ${err}`, 'error')
    }
    setLoading(false)
  }

  const reopenCurrent = async () => {
    if (openFile) await openIni(openFile.client, openFile.filename)
  }

  const openConfigFolder = async () => {
    try {
      const path = await api.getConfigPath()
      await revealItemInDir(path.replace(/\\/g, '/'))
    } catch (err) {
      addToast(
        `Couldn't open your config folder: ${err}. Try opening it manually from File Explorer instead.`,
        'error'
      )
    }
  }

  const saveAllChanges = async () => {
    const dirtySections = Object.keys(edits)
    if (dirtySections.length === 0) return

    setLoading(true)
    try {
      for (const section of dirtySections) {
        await api.saveSection(section, Object.entries(edits[section]))
      }
      addToast(`Saved ${dirtySections.length} section${dirtySections.length > 1 ? 's' : ''}`, 'success')
      await reopenCurrent()
    } catch (err) {
      addToast(`Couldn't save your changes: ${err}`, 'error')
    }
    setLoading(false)
  }

  const applyAudioPresets = async () => {
    setLoading(true)
    try {
      await api.applyAudioPresets()
      addToast('Audio presets applied to this file.', 'success')
      await reopenCurrent()
    } catch (err) {
      addToast(`Couldn't apply the audio presets: ${err}`, 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshIniFiles()
  }, [])

  const updateKey = (section: string, key: string, value: string, originalValue: string) => {
    setEdits(prev => {
      const sectionEdits = { ...(prev[section] ?? {}) }
      if (value === originalValue) delete sectionEdits[key]
      else sectionEdits[key] = value

      const next = { ...prev }
      if (Object.keys(sectionEdits).length === 0) delete next[section]
      else next[section] = sectionEdits
      return next
    })
  }

  const resetSectionChanges = (sectionName: string) => {
    setEdits(prev => {
      if (!(sectionName in prev)) return prev
      const next = { ...prev }
      delete next[sectionName]
      return next
    })
  }

  const dirtySectionCount = Object.keys(edits).length
  const isDirty = dirtySectionCount > 0
  const visibleSections = openFile?.sections.filter(s => s.keys.length > 0) ?? []

  if (files.windows.length === 0 && files.egs.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Folder className="w-16 h-16 mx-auto text-primary-bright mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Config Files Found</h1>
            <p className="text-muted mb-6">
              We couldn't find any INI files in your DBD config folders (WindowsClient or EGSClient).
            </p>
            <button onClick={refreshIniFiles} disabled={loading} className="app-btn app-btn-primary rounded-lg">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        </div>
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-6 pt-6 pb-4">
        <div className="max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[3px] text-faint mb-1">INI Editor</div>
            <div className="text-2xl font-semibold tracking-tight">Config Files</div>
          </div>
          <Tooltip label="Open your DBD config folder">
            <button onClick={openConfigFolder} className="app-btn app-btn-ghost rounded-lg">
              <FolderOpen size={14} />
              Open Folder
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="shrink-0 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex gap-1 px-6 overflow-x-auto pb-2">
          {(['windows', 'egs'] as GameClient[]).flatMap(client =>
            files[client].map(filename => (
              <FileTab
                key={`${client}-${filename}`}
                client={client}
                filename={filename}
                active={openFile?.client === client && openFile.filename === filename}
                onOpen={() => openIni(client, filename)}
              />
            ))
          )}
        </div>
      </div>

      {openFile ? (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xl font-semibold font-mono tracking-tight">
                {fileLabel(openFile.client, openFile.filename)}
              </div>
              <div className="flex items-center gap-2">
                <Tooltip label="Set this file's audio quality to our recommended values">
                  <button
                    onClick={applyAudioPresets}
                    disabled={loading}
                    className="app-btn app-btn-ghost app-btn-ghost--success rounded-lg"
                  >
                    <Settings size={14} />
                    Apply Audio Presets
                  </button>
                </Tooltip>
                <Tooltip label="Save your changes to this file">
                  <button
                    onClick={saveAllChanges}
                    disabled={loading || !isDirty}
                    className="app-btn app-btn-primary rounded-lg"
                  >
                    <Save size={14} />
                    Save Changes
                  </button>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <p className="text-muted text-sm">
                {isDirty
                  ? `Unsaved changes in ${dirtySectionCount} section${dirtySectionCount > 1 ? 's' : ''}`
                  : `${visibleSections.length} sections`}
              </p>
              {isDirty && (
                <Tooltip label="Discard every unsaved change in this file">
                  <button
                    onClick={() => setEdits({})}
                    className="text-xs text-primary-bright hover:text-white cursor-pointer underline underline-offset-2"
                  >
                    Reset all
                  </button>
                </Tooltip>
              )}
            </div>

            <div className="space-y-3">
              {visibleSections.map(section => {
                const sectionEdits = edits[section.name] ?? {}
                const sectionDirtyCount = Object.keys(sectionEdits).length
                return (
                  <CollapsibleSection
                    key={section.name}
                    title={section.name}
                    meta={sectionDirtyCount > 0 ? `${sectionDirtyCount} edited` : `${section.keys.length} options`}
                    dirty={sectionDirtyCount > 0}
                    defaultOpen={false}
                    headerAction={
                      sectionDirtyCount > 0 && (
                        <Tooltip label="Reset this section to default">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              resetSectionChanges(section.name)
                            }}
                            className="text-faint hover:text-tertiary cursor-pointer shrink-0"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </Tooltip>
                      )
                    }
                  >
                    {section.keys.map(([key, currentValue]) => (
                      <KeyRow
                        key={key}
                        keyName={key}
                        currentValue={currentValue}
                        editedValue={sectionEdits[key]}
                        onChange={value => updateKey(section.name, key, value, currentValue)}
                        onReset={() => updateKey(section.name, key, currentValue, currentValue)}
                      />
                    ))}
                  </CollapsibleSection>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-ghost">No file selected</div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default IniEditorPage
