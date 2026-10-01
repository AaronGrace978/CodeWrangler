import type { WebContents } from 'electron'
import {
  mergeCatalog,
  providerInfo,
  selectAnthropicModels,
  selectOllamaModels,
  selectOpenAIModels,
  selectOpenRouterModels
} from '../shared/catalog'
import { friendlyHttpError, friendlyNetworkError, missingKeyMessage, redactSecrets } from '../shared/errors'
import { systemPrompt, userPrompt } from '../shared/prompts'
import { consumeSseBlock, interpretStreamPayload, textFromProviderResponse, type StreamPiece } from '../shared/stream'
import type { CatalogModel, ExplainRequest, ExplainResult, ModelRefresh, ProviderId } from '../shared/types'
import { activeProvider, keyFor } from './store'

type Shape = 'responses' | 'chat' | 'anthropic' | 'ollama'

let active: AbortController | null = null

const HOSTS = new Set(['api.openai.com', 'api.anthropic.com', 'openrouter.ai', 'ollama.com'])

export function cancelExplain(): void {
  active?.abort()
}

function assertCloud(url: string): void {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || !HOSTS.has(parsed.hostname)) {
    throw new Error('CodeWrangler only talks to OpenAI, Anthropic, OpenRouter, and Ollama Cloud.')
  }
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  signal: AbortSignal
): Promise<Response> {
  assertCloud(url)
  return fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'CodeWrangler/1.0',
      ...headers
    },
    body: JSON.stringify(body),
    signal
  })
}

async function errorText(response: Response, provider: ProviderId, secret: string): Promise<string> {
  const text = await response.text()
  let body: unknown = text
  try {
    body = JSON.parse(text) as unknown
  } catch {
    body = text
  }
  return friendlyHttpError(response.status, body, provider, [secret])
}

function pieceFor(shape: Shape, raw: unknown): StreamPiece {
  if (shape === 'responses') return interpretStreamPayload('openai', raw)
  if (shape === 'anthropic') return interpretStreamPayload('anthropic', raw)
  if (shape === 'ollama') return interpretStreamPayload('ollama', raw)
  return interpretStreamPayload('openrouter', raw)
}

function supportsEffort(model: string): boolean {
  return /^claude-(sonnet|opus|fable)-5/.test(model)
}

async function readStream(
  response: Response,
  shape: Shape,
  secret: string,
  signal: AbortSignal,
  onText: (text: string) => void
): Promise<void> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('The provider sent an empty reply.')
  const decoder = new TextDecoder()
  let buffer = ''
  let failed = ''

  const take = (raw: unknown) => {
    const piece = pieceFor(shape, raw)
    if (piece.error) failed = redactSecrets(piece.error, [secret])
    if (piece.text) onText(piece.text)
    return piece.done || Boolean(piece.error)
  }

  while (!signal.aborted && !failed) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    if (shape === 'ollama') {
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          if (take(JSON.parse(trimmed) as unknown)) {
            await reader.cancel()
            if (failed) throw new Error(failed)
            return
          }
        } catch (error) {
          if (failed) throw new Error(failed)
          if (error instanceof SyntaxError) continue
          throw error
        }
      }
      continue
    }

    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''
    for (const block of blocks) {
      const event = consumeSseBlock(block)
      if (!event.data) continue
      if (event.data.trim() === '[DONE]') return
      try {
        if (take(JSON.parse(event.data) as unknown)) {
          await reader.cancel()
          if (failed) throw new Error(failed)
          return
        }
      } catch (error) {
        if (failed) throw new Error(failed)
        if (error instanceof SyntaxError) continue
        throw error
      }
    }
  }

  if (failed) throw new Error(failed)
  if (signal.aborted) await reader.cancel()
}

function chatBody(model: string, system: string, user: string, maxTokens: number): Record<string, unknown> {
  return {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    stream: true,
    max_tokens: maxTokens
  }
}

async function openAIResponse(
  key: string,
  model: string,
  system: string,
  user: string,
  stream: boolean,
  signal: AbortSignal
): Promise<{ response: Response; shape: Shape }> {
  const make = (store: boolean) =>
    postJson(
      'https://api.openai.com/v1/responses',
      { authorization: `Bearer ${key}` },
      {
        model,
        instructions: system,
        input: user,
        stream,
        max_output_tokens: stream ? 2500 : 200,
        ...(store ? {} : { store: false })
      },
      signal
    )

  let response = await make(false)
  if (!response.ok) {
    const text = await response.clone().text()
    if (response.status === 400 && /store/i.test(text)) response = await make(true)
  }
  if (!response.ok) {
    const text = await response.clone().text()
    if (response.status === 404 || /chat\/completions|not supported|unsupported model/i.test(text)) {
      const chat = await postJson(
        'https://api.openai.com/v1/chat/completions',
        { authorization: `Bearer ${key}` },
        { ...chatBody(model, system, user, stream ? 2500 : 200), stream },
        signal
      )
      return { response: chat, shape: 'chat' }
    }
  }
  return { response, shape: 'responses' }
}

async function anthropicResponse(
  key: string,
  model: string,
  system: string,
  user: string,
  stream: boolean,
  signal: AbortSignal
): Promise<Response> {
  const make = (effort: boolean) => {
    const body: Record<string, unknown> = {
      model,
      max_tokens: stream ? 4096 : 200,
      system,
      messages: [{ role: 'user', content: user }],
      stream
    }
    if (effort) body.output_config = { effort: 'medium' }
    return postJson(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body,
      signal
    )
  }

  const effort = supportsEffort(model)
  let response = await make(effort)
  if (!response.ok && effort) {
    const text = await response.clone().text()
    if (response.status === 400 && /output_config|effort/i.test(text)) response = await make(false)
  }
  return response
}

export async function explain(sender: WebContents, request: ExplainRequest): Promise<ExplainResult> {
  active?.abort()
  const controller = new AbortController()
  active = controller
  let stopReason: 'user' | 'timeout' | null = null
  const timeout = setTimeout(() => {
    stopReason = 'timeout'
    controller.abort()
  }, 120_000)
  controller.signal.addEventListener('abort', () => {
    if (!stopReason) stopReason = 'user'
  })
  const stopped = (): ExplainResult =>
    stopReason === 'timeout'
      ? { ok: false, message: 'This is taking too long. The provider did not finish. You can try again.' }
      : { ok: true, cancelled: true }
  let pending = ''
  let timer: NodeJS.Timeout | null = null
  let written = ''

  const flush = () => {
    if (!pending || sender.isDestroyed()) return
    sender.send('explain:chunk', pending)
    pending = ''
  }
  const push = (text: string) => {
    written += text
    pending += text
    if (!timer) {
      timer = setTimeout(() => {
        timer = null
        flush()
      }, 40)
    }
  }

  try {
    const settings = activeProvider()
    const secret = keyFor(settings.provider)
    if (!secret) return { ok: false, message: missingKeyMessage(settings.provider) }
    const model = settings.useCustomModel && settings.customModel ? settings.customModel : settings.models[settings.provider]
    const system = systemPrompt(request.readingLevel)
    const user = userPrompt(request)
    const signal = controller.signal

    let response: Response
    let shape: Shape
    try {
      if (settings.provider === 'openai') {
        const result = await openAIResponse(secret, model, system, user, true, signal)
        response = result.response
        shape = result.shape
      } else if (settings.provider === 'anthropic') {
        response = await anthropicResponse(secret, model, system, user, true, signal)
        shape = 'anthropic'
      } else if (settings.provider === 'openrouter') {
        response = await postJson(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            authorization: `Bearer ${secret}`,
            'http-referer': 'https://github.com/AaronGrace978/CodeWrangler',
            'x-title': 'CodeWrangler'
          },
          chatBody(model, system, user, 2500),
          signal
        )
        shape = 'chat'
      } else {
        response = await postJson(
          'https://ollama.com/api/chat',
          { authorization: `Bearer ${secret}` },
          { model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], stream: true },
          signal
        )
        shape = 'ollama'
      }
    } catch (error) {
      if (signal.aborted) return stopped()
      return { ok: false, message: friendlyNetworkError(settings.provider) }
    }

    if (!response.ok) return { ok: false, message: await errorText(response, settings.provider, secret) }

    try {
      await readStream(response, shape, secret, signal, push)
    } catch (error) {
      if (signal.aborted) return stopped()
      const message = error instanceof Error ? error.message : friendlyNetworkError(settings.provider)
      return { ok: false, message }
    }

    flush()
    if (signal.aborted) return stopped()
    if (!written.trim()) {
      return { ok: false, message: 'The model sent back an empty page. Try again, or choose another model in Settings.' }
    }
    return { ok: true, cancelled: false }
  } finally {
    if (timer) clearTimeout(timer)
    clearTimeout(timeout)
    flush()
    if (active === controller) active = null
  }
}

export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  const settings = activeProvider()
  const secret = keyFor(settings.provider)
  if (!secret) return { ok: false, message: missingKeyMessage(settings.provider) }
  const model = settings.useCustomModel && settings.customModel ? settings.customModel : settings.models[settings.provider]
  const system = 'Reply with exactly the word ready.'
  const user = 'Say ready.'
  const signal = AbortSignal.timeout(45_000)
  try {
    let response: Response
    let shape: Shape
    if (settings.provider === 'openai') {
      const result = await openAIResponse(secret, model, system, user, false, signal)
      response = result.response
      shape = result.shape
    } else if (settings.provider === 'anthropic') {
      response = await anthropicResponse(secret, model, system, user, false, signal)
      shape = 'anthropic'
    } else if (settings.provider === 'openrouter') {
      response = await postJson(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          authorization: `Bearer ${secret}`,
          'http-referer': 'https://github.com/AaronGrace978/CodeWrangler',
          'x-title': 'CodeWrangler'
        },
        { ...chatBody(model, system, user, 200), stream: false },
        signal
      )
      shape = 'chat'
    } else {
      response = await postJson(
        'https://ollama.com/api/chat',
        { authorization: `Bearer ${secret}` },
        { model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], stream: false },
        signal
      )
      shape = 'ollama'
    }
    if (!response.ok) return { ok: false, message: await errorText(response, settings.provider, secret) }
    const payload = (await response.json()) as unknown
    const provider: ProviderId =
      shape === 'responses' ? 'openai' : shape === 'anthropic' ? 'anthropic' : shape === 'ollama' ? 'ollama' : 'openrouter'
    const reply = textFromProviderResponse(provider, payload).replace(/\s+/g, ' ').trim()
    if (!reply) return { ok: true, message: `Connected to ${providerInfo(settings.provider).label}. The key was accepted.` }
    return { ok: true, message: `Connected. The model replied: ${reply.slice(0, 80)}` }
  } catch {
    return { ok: false, message: friendlyNetworkError(settings.provider) }
  }
}

export async function refreshModels(provider: ProviderId): Promise<ModelRefresh> {
  const curated = providerInfo(provider).models
  const secret = keyFor(provider)
  if ((provider === 'openai' || provider === 'anthropic') && !secret) {
    return {
      models: curated,
      message: 'Add a key to load the models on your account. The built-in list is ready to use.'
    }
  }
  const headers: Record<string, string> = { 'user-agent': 'CodeWrangler/1.0' }
  let url = ''
  if (provider === 'openai') {
    url = 'https://api.openai.com/v1/models'
    headers.authorization = `Bearer ${secret}`
  } else if (provider === 'anthropic') {
    url = 'https://api.anthropic.com/v1/models'
    headers['x-api-key'] = secret ?? ''
    headers['anthropic-version'] = '2023-06-01'
  } else if (provider === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/models'
  } else {
    url = 'https://ollama.com/api/tags'
  }
  try {
    assertCloud(url)
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) })
    if (!response.ok) {
      return { models: curated, message: await errorText(response, provider, secret ?? '') }
    }
    const payload = (await response.json()) as unknown
    const fresh =
      provider === 'openai'
        ? selectOpenAIModels(payload)
        : provider === 'anthropic'
          ? selectAnthropicModels(payload)
          : provider === 'openrouter'
            ? selectOpenRouterModels(payload)
            : selectOllamaModels(payload)
    if (!fresh.length) {
      return { models: curated, message: 'The provider did not return any text models. The built-in list is still here.' }
    }
    return { models: mergeCatalog(curated, fresh) }
  } catch {
    return { models: curated, message: friendlyNetworkError(provider) }
  }
}
