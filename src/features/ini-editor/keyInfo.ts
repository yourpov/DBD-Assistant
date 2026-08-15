import type { FieldOption } from '../../components/FieldSelect'

export interface FieldSpec {
  options: FieldOption[]
}

const boolOptions = (trueValue: string, falseValue: string, recommended?: boolean): FieldOption[] => [
  { value: trueValue, label: 'On', recommended: recommended === true },
  { value: falseValue, label: 'Off', recommended: recommended === false },
]

const percentOptions = (): FieldOption[] =>
  ['0.0', '0.25', '0.5', '0.75', '1.0'].map(v => ({ value: v, label: `${Math.round(parseFloat(v) * 100)}%` }))

const qualityTierOptions = (): FieldOption[] =>
  ['0', '1', '2', '3'].map((v, i) => ({ value: v, label: ['Low', 'Medium', 'High', 'Epic'][i] }))

const resolutionScaleOptions = (): FieldOption[] =>
  ['50', '60', '70', '80', '90', '100'].map(v => ({ value: v, label: `${v}%` }))

const SCALABILITY_GROUPS = [
  'sg.ViewDistanceQuality',
  'sg.AntiAliasingQuality',
  'sg.ShadowQuality',
  'sg.GlobalIlluminationQuality',
  'sg.ReflectionQuality',
  'sg.PostProcessQuality',
  'sg.TextureQuality',
  'sg.EffectsQuality',
  'sg.FoliageQuality',
  'sg.ShadingQuality',
  'sg.LandscapeQuality',
  'sg.AnimationQuality',
] as const

export const FIELD_SPECS: Record<string, FieldSpec> = {
  bUseHeadphoneMode: { options: boolOptions('True', 'False') },
  bUseSpatialization: { options: boolOptions('True', 'False', true) },
  iAudioQualityLevel: { options: ['0', '1', '2', '3', '4', '5'].map(v => ({ value: v, label: v, recommended: v === '5' }))},
  eAudioQuality: { options: ['Low', 'Medium', 'High', 'Epic'].map(v => ({ value: v, label: v, recommended: v === 'High' }))},
  fAudioMasterVolume: { options: percentOptions() },
  fAudioMusicVolume: { options: percentOptions() },
  fAudioSFXVolume: { options: percentOptions() },
  'r.ScreenWidth': { options: ['1280', '1600', '1920', '2560', '3440', '3840'].map(v => ({ value: v, label: `${v}px` }))},
  'r.ScreenHeight': {options: ['720', '900', '1080', '1440', '2160'].map(v => ({ value: v, label: `${v}px` }))},
  bSteam: { options: boolOptions('1', '0') },
  'sg.ResolutionQuality': { options: resolutionScaleOptions() },
  ...Object.fromEntries(SCALABILITY_GROUPS.map(key => [key, { options: qualityTierOptions() }])),
}

export const KEY_DESCRIPTIONS: Record<string, string> = {
  bUseHeadphoneMode: 'Optimizes audio for headphones with virtual surround sound.',
  bUseSpatialization: 'Positions footsteps and the terror radius in 3D space around you.',
  iAudioQualityLevel: 'Overall audio quality. Higher levels cost more CPU and memory.',
  eAudioQuality: 'Audio mixer quality tier.',
  fAudioMasterVolume: 'Overall volume for everything you hear.',
  fAudioMusicVolume: 'Volume for music and stingers.',
  fAudioSFXVolume: 'Volume for sound effects.',
  'r.ScreenWidth': 'Render width, in pixels.',
  'r.ScreenHeight': 'Render height, in pixels.',
  bSteam: 'Enables Steam overlay and achievements for this profile.',
  'sg.ResolutionQuality': 'Render resolution as a percentage of your screen size. Lower boosts FPS.',
  'sg.ViewDistanceQuality': 'How far detailed objects and foliage render before fading or vanishing.',
  'sg.AntiAliasingQuality': 'Smooths jagged edges. Higher looks cleaner but costs more GPU.',
  'sg.ShadowQuality': 'Shadow resolution and draw distance.',
  'sg.GlobalIlluminationQuality': 'Quality of indirect, bounced lighting.',
  'sg.ReflectionQuality': 'Quality of reflections on water, metal, and glass.',
  'sg.PostProcessQuality': 'Screen-space effects: bloom, depth of field, ambient occlusion.',
  'sg.TextureQuality': 'Texture resolution. Higher uses more VRAM.',
  'sg.EffectsQuality': 'Particle effects: fog, sparks, blood, smoke.',
  'sg.FoliageQuality': 'Grass and foliage density.',
  'sg.ShadingQuality': 'Material and lighting shader complexity.',
  'sg.LandscapeQuality': 'Terrain detail and tessellation.',
  'sg.AnimationQuality': 'Animation detail for characters at a distance.',
}

const UNEDITABLE: FieldSpec = { options: [] }

export function fieldSpecFor(key: string, currentValue: string): FieldSpec {
  const spec = FIELD_SPECS[key]
  if (!spec) return UNEDITABLE
  if (spec.options.some(o => o.value === currentValue)) return spec
  return { options: [{ value: currentValue, label: `${currentValue} (current)` }, ...spec.options] }
}
