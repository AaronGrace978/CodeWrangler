import { app, safeStorage } from 'electron'
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { activeModelId, defaultModels, describeModel, isModelId, providerInfo } from '../shared/catalog'
import { hintOrEmpty } from '../shared/settings'
import type { ProviderId, PublicSettings, ReadingLevel, SettingsPatch } from '../shared/types'
import { PROVIDER_IDS, READING_LEVELS } from '../shared/types'

type Memory = {
  provider: ProviderId
  models: Record<ProviderId, string>
  useCustomModel: boolean
  customModel: string
  readingLevel: ReadingLevel
  keys: Partial<Record<ProviderId, string>>
}

let memory: Memory | null = null

function defaults(): Memory {
  return {
    provider: 'openai',
    models: defaultModels(),
    useCustomModel: false,
    customModel: '',
    readingLevel: 'everyday',
    keys: {}
  }
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function lock(value: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return `enc:${safeStorage.encryptString(value).toString('base64')}`
  }
  return `plain:${Buffer.from(value, 'utf8').toString('base64')}`
}

function unlock(value: string): string {
  if (value.startsWith('enc:')) return safeStorage.decryptString(Buffer.from(value.slice(4), 'base64'))
  if (value.startsWith('plain:')) return Buffer.from(value.slice(6), 'base64').toString('utf8')
  return ''
}

function isProvider(value: unknown): value is ProviderId {
  return typeof value === 'string' && PROVIDER_IDS.includes(value as ProviderId)
}

function readFile(): Memory {
  const path = settingsPath()
  if (!existsSync(path)) return defaults()
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
    const next = defaults()
    if (isProvider(parsed.provider)) next.provider = parsed.provider
    if (parsed.readingLevel === 'everyday' || parsed.readingLevel === 'curious' || parsed.readingLevel === 'teacher') {
      next.readingLevel = parsed.readingLevel
    }
    if (typeof parsed.useCustomModel === 'boolean') next.useCustomModel = parsed.useCustomModel
    if (typeof parsed.customModel === 'string' && (!parsed.customModel.trim() || isModelId(parsed.customModel.trim()))) {
      next.customModel = parsed.customModel.trim()
    }
    if (parsed.models && typeof parsed.models === 'object') {
      for (const id of PROVIDER_IDS) {
        const value = (parsed.models as Record<string, unknown>)[id]
        if (typeof value === 'string' && isModelId(value)) next.models[id] = value
      }
    }
    if (parsed.keys && typeof parsed.keys === 'object') {
      for (const id of PROVIDER_IDS) {
        const value = (parsed.keys as Record<string, unknown>)[id]
        if (typeof value !== 'string' || !value) continue
        try {
          const key = unlock(value).trim()
          if (key) next.keys[id] = key
        } catch {
          // A key this computer cannot unlock is left out. The reader can paste it again.
        }
      }
    }
    return next
  } catch {
    return defaults()
  }
}

function load(): Memory {
  if (!memory) memory = readFile()
  return memory
}

function save(next: Memory): void {
  const path = settingsPath()
  mkdirSync(dirname(path), { recursive: true })
  const keys: Partial<Record<ProviderId, string>> = {}
  for (const id of PROVIDER_IDS) {
    const key = next.keys[id]
    if (key) keys[id] = lock(key)
  }
  const body = {
    provider: next.provider,
    models: next.models,
    useCustomModel: next.useCustomModel,
    customModel: next.customModel,
    readingLevel: next.readingLevel,
    keys
  }
  writeFileSync(path, JSON.stringify(body, null, 2), { encoding: 'utf8', mode: 0o600 })
  try {
    chmodSync(path, 0o600)
  } catch {
    // Windows does not use these permissions. The file still lives in the user's app data.
  }
  memory = next
}

export function encryptionMode(): 'locked' | 'plain' {
  return safeStorage.isEncryptionAvailable() ? 'locked' : 'plain'
}

export function getSettings(): PublicSettings {
  const current = load()
  const keys = Object.fromEntries(PROVIDER_IDS.map((id) => [id, hintOrEmpty(current.keys[id])])) as PublicSettings['keys']
  return {
    provider: current.provider,
    models: { ...current.models },
    useCustomModel: current.useCustomModel,
    customModel: current.customModel,
    readingLevel: current.readingLevel,
    version: app.getVersion(),
    encryption: encryptionMode(),
    keys,
    activeModelId: activeModelId(current),
    activeModelLabel: describeModel(current)
  }
}

export function updateSettings(patch: SettingsPatch): PublicSettings {
  const current = load()
  if (patch.provider && PROVIDER_IDS.includes(patch.provider)) current.provider = patch.provider
  if (patch.readingLevel && READING_LEVELS.includes(patch.readingLevel)) current.readingLevel = patch.readingLevel
  if (typeof patch.useCustomModel === 'boolean') current.useCustomModel = patch.useCustomModel
  if (typeof patch.customModel === 'string') current.customModel = patch.customModel
  if (patch.models) current.models = { ...current.models, ...patch.models }
  if (patch.keys) {
    for (const id of PROVIDER_IDS) {
      if (!(id in patch.keys)) continue
      const value = patch.keys[id]
      if (!value) delete current.keys[id]
      else current.keys[id] = value
    }
  }
  save(current)
  return getSettings()
}

export function keyFor(provider: ProviderId): string | undefined {
  return load().keys[provider]
}

export function activeProvider(): Memory {
  return load()
}

export function providerLabel(provider: ProviderId): string {
  return providerInfo(provider).label
}
