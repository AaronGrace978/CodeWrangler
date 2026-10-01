import type { ProviderId } from './types'
import { providerInfo } from './catalog'

export function extractErrorMessage(body: unknown): string {
  if (typeof body === 'string') return body.trim()
  if (!body || typeof body !== 'object') return ''
  const record = body as Record<string, unknown>
  if (typeof record.error === 'string') return record.error.trim()
  if (record.error && typeof record.error === 'object') {
    const nested = record.error as Record<string, unknown>
    if (typeof nested.message === 'string') return nested.message.trim()
  }
  if (typeof record.message === 'string') return record.message.trim()
  return ''
}

export function redactSecrets(text: string, secrets: string[]): string {
  let out = text
  for (const secret of secrets) {
    const trimmed = secret.trim()
    if (trimmed.length < 8) continue
    out = out.split(trimmed).join('the saved key')
  }
  return out.replace(/\s+/g, ' ').trim().slice(0, 500)
}

export function friendlyHttpError(status: number, body: unknown, provider: ProviderId, secrets: string[]): string {
  const label = providerInfo(provider).label
  const detail = redactSecrets(extractErrorMessage(body), secrets)
  if (status === 401 || status === 403) {
    return `The key was not accepted by ${label}. Open Settings and check that the key belongs to ${label}.`
  }
  if (status === 404) {
    return detail
      ? `${label} could not find that model. ${detail}`
      : `That model was not found at ${label}. Choose another model in Settings.`
  }
  if (status === 429) {
    return `${label} asked CodeWrangler to slow down. Wait a moment, then try the page again.`
  }
  if (status >= 500) {
    return `${label} had a problem on its side. Your page is still here. Try again in a little while.`
  }
  if (detail) return `${label} could not answer. ${detail}`
  return `${label} could not answer (error ${status}).`
}

export function friendlyNetworkError(provider: ProviderId): string {
  const label = providerInfo(provider).label
  return `CodeWrangler could not reach ${label}. Check your internet connection, then try again.`
}

export function missingKeyMessage(provider: ProviderId): string {
  const info = providerInfo(provider)
  return `This page can be read as printed. To ask ${info.label} for a fresh explanation, open Settings and paste a key. The key stays on this computer.`
}
