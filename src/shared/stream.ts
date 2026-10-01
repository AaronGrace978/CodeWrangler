import type { ProviderId } from './types'

export type StreamPiece = {
  text: string
  done: boolean
  error?: string
}

export function consumeSseBlock(block: string): { event: string; data: string } {
  let event = ''
  const data: string[] = []
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''))
  }
  return { event, data: data.join('\n') }
}

function textFromContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((part) => {
      if (typeof part === 'string') return part
      if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') return part.text
      return ''
    })
    .join('')
}

function errorFrom(raw: Record<string, unknown>): string {
  if (typeof raw.error === 'string') return raw.error
  if (raw.error && typeof raw.error === 'object') {
    const nested = raw.error as Record<string, unknown>
    if (typeof nested.message === 'string') return nested.message
  }
  if (typeof raw.message === 'string') return raw.message
  const response = raw.response
  if (response && typeof response === 'object') {
    const nested = (response as Record<string, unknown>).error
    if (nested && typeof nested === 'object' && typeof (nested as Record<string, unknown>).message === 'string') {
      return (nested as Record<string, unknown>).message as string
    }
  }
  return 'The model stopped before it finished the page.'
}

export function interpretStreamPayload(provider: ProviderId, raw: unknown): StreamPiece {
  if (typeof raw === 'string') {
    if (raw.trim() === '[DONE]') return { text: '', done: true }
    return { text: '', done: false }
  }
  if (!raw || typeof raw !== 'object') return { text: '', done: false }
  const record = raw as Record<string, unknown>
  const type = typeof record.type === 'string' ? record.type : ''

  if (provider === 'openai') {
    if (type === 'response.output_text.delta') {
      const delta = record.delta
      const text = typeof delta === 'string' ? delta : textFromContent(delta)
      return { text, done: false }
    }
    if (type === 'response.completed' || type === 'response.incomplete') return { text: '', done: true }
    if (type === 'error' || type === 'response.failed') return { text: '', done: true, error: errorFrom(record) }
    return { text: '', done: false }
  }

  if (provider === 'anthropic') {
    if (type === 'content_block_delta') {
      const delta = record.delta
      if (delta && typeof delta === 'object') {
        const piece = delta as Record<string, unknown>
        if (piece.type === 'text_delta' && typeof piece.text === 'string') {
          return { text: piece.text, done: false }
        }
      }
      return { text: '', done: false }
    }
    if (type === 'message_stop') return { text: '', done: true }
    if (type === 'error') return { text: '', done: true, error: errorFrom(record) }
    return { text: '', done: false }
  }

  if (provider === 'ollama') {
    if (typeof record.error === 'string') return { text: '', done: true, error: record.error }
    const message = record.message
    const text =
      message && typeof message === 'object' && typeof (message as Record<string, unknown>).content === 'string'
        ? ((message as Record<string, unknown>).content as string)
        : ''
    return { text, done: record.done === true }
  }

  const choices = Array.isArray(record.choices) ? record.choices : []
  const choice = choices[0] && typeof choices[0] === 'object' ? (choices[0] as Record<string, unknown>) : null
  if (!choice) {
    if (typeof record.error === 'string' || (record.error && typeof record.error === 'object')) {
      return { text: '', done: true, error: errorFrom(record) }
    }
    return { text: '', done: false }
  }
  const delta = choice.delta && typeof choice.delta === 'object' ? (choice.delta as Record<string, unknown>) : null
  const text = delta ? textFromContent(delta.content) : ''
  const done = typeof choice.finish_reason === 'string' && choice.finish_reason.length > 0
  return { text, done }
}

export function textFromProviderResponse(provider: ProviderId, payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as Record<string, unknown>
  if (provider === 'openai') {
    if (typeof record.output_text === 'string') return record.output_text
    if (!Array.isArray(record.output)) return ''
    return record.output
      .map((item) => {
        if (!item || typeof item !== 'object') return ''
        const content = (item as Record<string, unknown>).content
        return textFromContent(content)
      })
      .join('')
  }
  if (provider === 'anthropic') {
    return textFromContent(record.content)
  }
  if (provider === 'ollama') {
    const message = record.message
    if (message && typeof message === 'object' && typeof (message as Record<string, unknown>).content === 'string') {
      return (message as Record<string, unknown>).content as string
    }
    return ''
  }
  const choices = Array.isArray(record.choices) ? record.choices : []
  const choice = choices[0] && typeof choices[0] === 'object' ? (choices[0] as Record<string, unknown>) : null
  const message = choice?.message
  if (message && typeof message === 'object') return textFromContent((message as Record<string, unknown>).content)
  return ''
}
