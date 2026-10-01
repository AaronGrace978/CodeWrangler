export type ProviderId = 'openai' | 'anthropic' | 'openrouter' | 'ollama'

export type ReadingLevel = 'everyday' | 'curious' | 'teacher'

export type ExplainTask = 'explain-code' | 'follow-up' | 'habit' | 'chapter' | 'demo'

export type CatalogModel = {
  id: string
  label: string
  note?: string
}

export type ExplainRequest = {
  task: ExplainTask
  readingLevel: ReadingLevel
  code?: string
  language?: string
  question?: string
  topicTitle?: string
  pageText?: string
}

export type SettingsPatch = {
  provider?: ProviderId
  models?: Partial<Record<ProviderId, string>>
  useCustomModel?: boolean
  customModel?: string
  readingLevel?: ReadingLevel
  keys?: Partial<Record<ProviderId, string>>
}

export type PublicSettings = {
  provider: ProviderId
  models: Record<ProviderId, string>
  useCustomModel: boolean
  customModel: string
  readingLevel: ReadingLevel
  version: string
  encryption: 'locked' | 'plain'
  keys: Record<ProviderId, { saved: boolean; hint: string }>
  activeModelId: string
  activeModelLabel: string
}

export type ExplainResult = { ok: true; cancelled: boolean } | { ok: false; message: string }

export type ModelRefresh = {
  models: CatalogModel[]
  message?: string
}

export const PROVIDER_IDS: ProviderId[] = ['openai', 'anthropic', 'openrouter', 'ollama']

export const READING_LEVELS: ReadingLevel[] = ['everyday', 'curious', 'teacher']

export const EXPLAIN_TASKS: ExplainTask[] = ['explain-code', 'follow-up', 'habit', 'chapter', 'demo']

export const LIMITS = {
  code: 24_000,
  codeHard: 100_000,
  question: 2_000,
  pageText: 12_000,
  topic: 200,
  language: 40,
  key: 500,
  customModel: 120
} as const
