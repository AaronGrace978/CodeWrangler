import type { CatalogModel, ProviderId } from './types'

export type ProviderInfo = {
  id: ProviderId
  label: string
  blurb: string
  keyHelp: string
  keyUrl: string
  defaultModel: string
  models: CatalogModel[]
}

/**
 * Model ids are the ones each provider expects.
 * OpenRouter uses dots in Claude ids (claude-sonnet-5.5).
 * Anthropic's own API uses hyphens (claude-sonnet-5-5).
 */
export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    blurb: 'GPT-6 Astra, GPT-6.1 Sol, GPT-6 Luna, and other current OpenAI models.',
    keyHelp: 'Create a key in your OpenAI account, then paste it here.',
    keyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-6.1-sol',
    models: [
      { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol', note: 'A strong everyday choice' },
      { id: 'gpt-6-luna', label: 'GPT-6 Luna', note: 'Faster, lighter replies' },
      { id: 'gpt-6-astra', label: 'GPT-6 Astra', note: 'The most capable OpenAI model' },
      { id: 'gpt-6.1-sol-pro', label: 'GPT-6.1 Sol Pro' },
      { id: 'gpt-6-sol', label: 'GPT-6 Sol' },
      { id: 'gpt-6-luna-pro', label: 'GPT-6 Luna Pro' },
      { id: 'gpt-6-astra-pro', label: 'GPT-6 Astra Pro' }
    ]
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    blurb: 'Claude, including Sonnet, Opus, Fable, and Haiku.',
    keyHelp: 'Create a key in the Claude console, then paste it here.',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-sonnet-5-5',
    models: [
      { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', note: 'A strong everyday choice' },
      { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', note: 'A deeper reading' },
      { id: 'claude-fable-5-1', label: 'Claude Fable 5.1', note: 'For the hardest pages' },
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', note: 'A quicker reply' },
      { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
      { id: 'claude-opus-5', label: 'Claude Opus 5' },
      { id: 'claude-fable-5', label: 'Claude Fable 5' },
      { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' }
    ]
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    blurb: 'One key for recent models from many companies.',
    keyHelp: 'Create a key at OpenRouter, then paste it here. One key can reach many models.',
    keyUrl: 'https://openrouter.ai/keys',
    defaultModel: 'anthropic/claude-sonnet-5.5',
    models: [
      { id: 'anthropic/claude-sonnet-5.5', label: 'Claude Sonnet 5.5', note: 'A strong everyday choice' },
      { id: 'openai/gpt-6.1-sol', label: 'GPT-6.1 Sol' },
      { id: 'openai/gpt-6-luna', label: 'GPT-6 Luna' },
      { id: 'openai/gpt-6-astra', label: 'GPT-6 Astra' },
      { id: 'anthropic/claude-opus-5.5', label: 'Claude Opus 5.5' },
      { id: 'anthropic/claude-fable-5.1', label: 'Claude Fable 5.1' },
      { id: 'google/gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
      { id: 'x-ai/grok-4.7', label: 'Grok 4.7' },
      { id: 'deepseek/deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash' },
      { id: 'qwen/qwen3.8-max-prime', label: 'Qwen3.8 Max Prime' }
    ]
  },
  {
    id: 'ollama',
    label: 'Ollama Cloud',
    blurb: 'Models hosted by Ollama. Nothing large is downloaded to this computer.',
    keyHelp: 'Create a key in your Ollama account, then paste it here.',
    keyUrl: 'https://ollama.com/settings/keys',
    defaultModel: 'gemma4:31b',
    models: [
      { id: 'gemma4:31b', label: 'Gemma 4 31B', note: 'A strong everyday choice' },
      { id: 'gpt-oss:20b', label: 'gpt-oss 20B', note: 'A smaller open model' },
      { id: 'gpt-oss:120b', label: 'gpt-oss 120B' },
      { id: 'glm-5.3-flash', label: 'GLM 5.3 Flash' },
      { id: 'deepseek-v4.1-flash', label: 'DeepSeek V4.1 Flash' },
      { id: 'kimi-k2.7-code', label: 'Kimi K2.7 Code' },
      { id: 'glm-5.3', label: 'GLM 5.3' },
      { id: 'kimi-k3', label: 'Kimi K3' },
      { id: 'nemotron-3-nano:30b', label: 'Nemotron 3 Nano 30B' },
      { id: 'minimax-m2.7', label: 'MiniMax M2.7' },
      { id: 'deepseek-v4-pro:0813', label: 'DeepSeek V4 Pro' },
      { id: 'mistral-large-3:675b', label: 'Mistral Large 3' }
    ]
  }
]

export function providerInfo(id: ProviderId): ProviderInfo {
  const found = PROVIDERS.find((provider) => provider.id === id)
  if (!found) throw new Error(`Unknown provider ${id}`)
  return found
}

export function defaultModels(): Record<ProviderId, string> {
  return {
    openai: providerInfo('openai').defaultModel,
    anthropic: providerInfo('anthropic').defaultModel,
    openrouter: providerInfo('openrouter').defaultModel,
    ollama: providerInfo('ollama').defaultModel
  }
}

export function activeModelId(input: {
  provider: ProviderId
  models: Record<ProviderId, string>
  useCustomModel: boolean
  customModel: string
}): string {
  if (input.useCustomModel && input.customModel.trim()) return input.customModel.trim()
  return input.models[input.provider] || providerInfo(input.provider).defaultModel
}

export function describeModel(input: {
  provider: ProviderId
  models: Record<ProviderId, string>
  useCustomModel: boolean
  customModel: string
}): string {
  const id = activeModelId(input)
  const provider = providerInfo(input.provider)
  const known = provider.models.find((model) => model.id === id)
  return `${known?.label ?? id} · ${provider.label}`
}

const MODEL_ID = /^[A-Za-z0-9_./:+-]{1,120}$/

export function isModelId(value: string): boolean {
  return MODEL_ID.test(value)
}

export function mergeCatalog(preferred: CatalogModel[], fresh: CatalogModel[]): CatalogModel[] {
  const seen = new Set<string>()
  const merged: CatalogModel[] = []
  for (const item of [...preferred, ...fresh]) {
    if (!item.id || seen.has(item.id) || !isModelId(item.id)) continue
    seen.add(item.id)
    merged.push({ id: item.id, label: item.label || item.id, note: item.note })
    if (merged.length >= 40) break
  }
  return merged
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function outputModalities(item: Record<string, unknown>): string[] {
  const architecture = asRecord(item.architecture)
  const listed = architecture?.output_modalities
  if (Array.isArray(listed)) return listed.filter((entry): entry is string => typeof entry === 'string')
  return []
}

export function selectOpenRouterModels(payload: unknown): CatalogModel[] {
  const root = asRecord(payload)
  const data = root && Array.isArray(root.data) ? root.data : Array.isArray(payload) ? payload : []
  const rows: Array<CatalogModel & { created: number }> = []
  for (const entry of data) {
    const item = asRecord(entry)
    if (!item || typeof item.id !== 'string') continue
    const id = item.id
    if (id.startsWith('~')) continue
    if (/:(batch|free|extended|nitro|floor|exacto)$/.test(id)) continue
    if (/image|embed|moderation|whisper|tts|transcribe|audio/i.test(id)) continue
    const modalities = outputModalities(item)
    if (modalities.length > 0 && !modalities.includes('text')) continue
    const name = typeof item.name === 'string' ? item.name.replace(/^[^:]+:\s*/, '') : id
    const created = typeof item.created === 'number' ? item.created : 0
    rows.push({ id, label: name, created })
  }
  rows.sort((a, b) => b.created - a.created)
  return mergeCatalog([], rows.map(({ id, label }) => ({ id, label })))
}

export function selectOllamaModels(payload: unknown): CatalogModel[] {
  const root = asRecord(payload)
  const models = root && Array.isArray(root.models) ? root.models : []
  const fresh: CatalogModel[] = []
  for (const entry of models) {
    const item = asRecord(entry)
    const name = item && typeof item.name === 'string' ? item.name : ''
    if (!name) continue
    fresh.push({ id: name, label: name })
  }
  return mergeCatalog([], fresh)
}

export function selectOpenAIModels(payload: unknown): CatalogModel[] {
  const root = asRecord(payload)
  const data = root && Array.isArray(root.data) ? root.data : []
  const rows: Array<CatalogModel & { created: number }> = []
  for (const entry of data) {
    const item = asRecord(entry)
    if (!item || typeof item.id !== 'string') continue
    const id = item.id
    if (!/^(gpt-|chatgpt-|o1|o3|o4)/.test(id)) continue
    if (/audio|realtime|tts|transcribe|image|embedding|moderation|whisper|dall-e|search|diarize|sora|cyber|daybreak/i.test(id)) {
      continue
    }
    const created = typeof item.created === 'number' ? item.created : 0
    rows.push({ id, label: id, created })
  }
  rows.sort((a, b) => b.created - a.created)
  return mergeCatalog([], rows.map(({ id, label }) => ({ id, label })))
}

export function selectAnthropicModels(payload: unknown): CatalogModel[] {
  const root = asRecord(payload)
  const data = root && Array.isArray(root.data) ? root.data : []
  const fresh: CatalogModel[] = []
  for (const entry of data) {
    const item = asRecord(entry)
    if (!item || typeof item.id !== 'string' || !item.id.startsWith('claude-')) continue
    const label = typeof item.display_name === 'string' ? item.display_name : item.id
    fresh.push({ id: item.id, label })
  }
  return mergeCatalog([], fresh)
}

export function keyHint(key: string): string {
  const trimmed = key.trim()
  if (trimmed.length < 8) return 'Saved'
  return `ends in ${trimmed.slice(-4)}`
}
