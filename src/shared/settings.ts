import { defaultModels, isModelId, keyHint } from './catalog'
import type { ProviderId, ReadingLevel, SettingsPatch } from './types'
import { EXPLAIN_TASKS, LIMITS, PROVIDER_IDS, READING_LEVELS, type ExplainRequest } from './types'

export type SanitizeResult<T> = { ok: true; value: T } | { ok: false; message: string }

function isProvider(value: unknown): value is ProviderId {
  return typeof value === 'string' && PROVIDER_IDS.includes(value as ProviderId)
}

function isLevel(value: unknown): value is ReadingLevel {
  return typeof value === 'string' && READING_LEVELS.includes(value as ReadingLevel)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function sanitizePatch(input: unknown): SanitizeResult<SettingsPatch> {
  const record = asRecord(input)
  if (!record) return { ok: false, message: 'Settings were not readable. Try again.' }
  const patch: SettingsPatch = {}

  if ('provider' in record) {
    if (!isProvider(record.provider)) return { ok: false, message: 'Choose OpenAI, Anthropic, OpenRouter, or Ollama Cloud.' }
    patch.provider = record.provider
  }

  if ('readingLevel' in record) {
    if (!isLevel(record.readingLevel)) return { ok: false, message: 'Choose a reading voice from the list.' }
    patch.readingLevel = record.readingLevel
  }

  if ('useCustomModel' in record) {
    if (typeof record.useCustomModel !== 'boolean') {
      return { ok: false, message: 'The custom model switch was not clear. Try again.' }
    }
    patch.useCustomModel = record.useCustomModel
  }

  if ('customModel' in record) {
    if (typeof record.customModel !== 'string') return { ok: false, message: 'The model id should be plain text.' }
    const customModel = record.customModel.trim()
    if (customModel && !isModelId(customModel)) {
      return { ok: false, message: 'That model id has characters CodeWrangler cannot send. Use letters, numbers, and . _ : / + -.' }
    }
    patch.customModel = customModel.slice(0, LIMITS.customModel)
  }

  if ('models' in record) {
    const models = asRecord(record.models)
    if (!models) return { ok: false, message: 'The model list was not readable.' }
    patch.models = {}
    for (const id of PROVIDER_IDS) {
      if (!(id in models)) continue
      const value = models[id]
      if (typeof value !== 'string' || !isModelId(value.trim())) {
        return { ok: false, message: 'One of the chosen models does not look like a model id.' }
      }
      patch.models[id] = value.trim()
    }
  }

  if ('keys' in record) {
    const keys = asRecord(record.keys)
    if (!keys) return { ok: false, message: 'The key was not readable.' }
    patch.keys = {}
    for (const id of PROVIDER_IDS) {
      if (!(id in keys)) continue
      const value = keys[id]
      if (typeof value !== 'string') return { ok: false, message: 'A key should be plain text.' }
      const trimmed = value.trim()
      if (!trimmed) {
        patch.keys[id] = ''
        continue
      }
      if (trimmed.length < 8 || trimmed.length > LIMITS.key || /\s/.test(trimmed)) {
        return {
          ok: false,
          message: 'That key does not look complete. Paste the whole key, with no spaces, and try again.'
        }
      }
      patch.keys[id] = trimmed
    }
  }

  return { ok: true, value: patch }
}

export function sanitizeExplainRequest(input: unknown): SanitizeResult<ExplainRequest> {
  const record = asRecord(input)
  if (!record) return { ok: false, message: 'The page could not be sent. Try again.' }
  if (typeof record.task !== 'string' || !EXPLAIN_TASKS.includes(record.task as ExplainRequest['task'])) {
    return { ok: false, message: 'CodeWrangler did not understand that request.' }
  }
  if (!isLevel(record.readingLevel)) return { ok: false, message: 'Choose a reading voice, then try again.' }

  const request: ExplainRequest = {
    task: record.task as ExplainRequest['task'],
    readingLevel: record.readingLevel
  }

  if (typeof record.code === 'string' && record.code.trim()) {
    if (record.code.length > LIMITS.codeHard) {
      return { ok: false, message: 'That page is too long to send. Paste one smaller piece of it.' }
    }
    request.code = record.code.slice(0, LIMITS.code)
  }
  if (typeof record.language === 'string') request.language = record.language.trim().slice(0, LIMITS.language)
  if (typeof record.question === 'string') request.question = record.question.trim().slice(0, LIMITS.question)
  if (typeof record.topicTitle === 'string') request.topicTitle = record.topicTitle.trim().slice(0, LIMITS.topic)
  if (typeof record.pageText === 'string') request.pageText = record.pageText.slice(0, LIMITS.pageText)

  if ((request.task === 'explain-code' || request.task === 'follow-up' || request.task === 'demo') && !request.code?.trim()) {
    return { ok: false, message: 'The left page is empty. Paste some code, or turn to a sample, then ask again.' }
  }
  if (request.task === 'follow-up' && !request.question) {
    return { ok: false, message: 'Type a question about the left page, then ask.' }
  }
  if ((request.task === 'chapter' || request.task === 'habit') && !request.pageText?.trim() && !request.question) {
    return { ok: false, message: 'Ask a question about this page, or ask the model to say it another way.' }
  }

  return { ok: true, value: request }
}

export function emptyPublicModels(): Record<ProviderId, string> {
  return defaultModels()
}

export function hintOrEmpty(key: string | undefined): { saved: boolean; hint: string } {
  if (!key) return { saved: false, hint: '' }
  return { saved: true, hint: keyHint(key) }
}
