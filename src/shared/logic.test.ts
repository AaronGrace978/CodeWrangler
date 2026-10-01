import { describe, expect, it } from 'vitest'
import { describeModel, mergeCatalog, selectAnthropicModels, selectOpenAIModels, selectOpenRouterModels, selectOllamaModels } from './catalog'
import { friendlyHttpError, redactSecrets } from './errors'
import { guessLanguage } from './guess'
import { bookPage, parseMarkdown } from './markdown'
import { systemPrompt, userPrompt } from './prompts'
import { sanitizeExplainRequest, sanitizePatch } from './settings'
import { consumeSseBlock, interpretStreamPayload, textFromProviderResponse } from './stream'
import { defaultModels } from './catalog'

describe('settings', () => {
  it('keeps a real key and rejects a broken one', () => {
    const saved = sanitizePatch({ provider: 'openai', keys: { openai: 'sk-test-key-1234' } })
    expect(saved.ok).toBe(true)
    if (saved.ok) expect(saved.value.keys?.openai).toBe('sk-test-key-1234')

    const broken = sanitizePatch({ keys: { anthropic: 'short' } })
    expect(broken.ok).toBe(false)
  })

  it('treats an empty key as a request to remove it', () => {
    const cleared = sanitizePatch({ keys: { ollama: '   ' } })
    expect(cleared.ok).toBe(true)
    if (cleared.ok) expect(cleared.value.keys?.ollama).toBe('')
  })

  it('rejects a model id with spaces', () => {
    const result = sanitizePatch({ customModel: 'not a model' })
    expect(result.ok).toBe(false)
  })
})

describe('explain requests', () => {
  it('refuses an empty page', () => {
    const result = sanitizeExplainRequest({ task: 'explain-code', readingLevel: 'everyday', code: '   ' })
    expect(result.ok).toBe(false)
  })

  it('keeps a normal page', () => {
    const result = sanitizeExplainRequest({
      task: 'explain-code',
      readingLevel: 'curious',
      code: 'const total = 4',
      language: 'JavaScript'
    })
    expect(result.ok).toBe(true)
  })
})

describe('prompts', () => {
  it('asks for everyday words and the book headings', () => {
    expect(systemPrompt('everyday')).toContain('neighbor')
    const prompt = userPrompt({
      task: 'explain-code',
      readingLevel: 'everyday',
      code: 'const muffins = 4',
      language: 'JavaScript'
    })
    expect(prompt).toContain('What it is linked to')
    expect(prompt).toContain('const muffins = 4')
    expect(prompt).not.toContain('exploit')
  })
})

describe('markdown', () => {
  it('reads headings, lists, and code without treating html as a tag', () => {
    const blocks = parseMarkdown(bookPage({
      short: 'A total.',
      does: 'It adds <script>alert(1)</script> as words, not as a program.',
      how: ['It multiplies.'],
      linked: 'Nothing else.',
      habit: 'Name the total.'
    }))
    expect(blocks.some((block) => block.type === 'h' && block.text === 'The short version')).toBe(true)
    expect(blocks.some((block) => block.type === 'ol')).toBe(true)
    expect(blocks.some((block) => block.type === 'p' && block.text.includes('<script>'))).toBe(true)
  })

  it('keeps fenced code together', () => {
    const blocks = parseMarkdown('```\nconst a = 1\n```')
    expect(blocks).toEqual([{ type: 'code', text: 'const a = 1' }])
  })
})

describe('language guesses', () => {
  it('recognizes the languages a reader is likely to paste', () => {
    expect(guessLanguage('<?php\necho "hi";')).toBe('PHP')
    expect(guessLanguage('{"title":"Soup"}')).toBe('JSON')
    expect(guessLanguage('SELECT title FROM books')).toBe('SQL')
    expect(guessLanguage('<article><h1>Soup</h1></article>')).toBe('HTML')
    expect(guessLanguage('.recipe { color: #241c14; }')).toBe('CSS')
    expect(guessLanguage('# Sunday\n\nA note.')).toBe('Markdown')
    expect(guessLanguage('#!/usr/bin/env bash\nmkdir -p "$HOME/notes"')).toBe('Bash')
    expect(guessLanguage('package main\nimport "fmt"\nfunc main() { fmt.Println("hi") }')).toBe('Go')
    expect(guessLanguage('fn main() {\n  let mut total = 0;\n}')).toBe('Rust')
    expect(guessLanguage('#include <stdio.h>\nint main(void) { return 0; }')).toBe('C')
    expect(guessLanguage('public class Greeting { }')).toBe('Java')
    expect(guessLanguage('Console.WriteLine("hi");')).toBe('C#')
    expect(guessLanguage('fun warmer(morning: Int): Int { return morning }')).toBe('Kotlin')
    expect(guessLanguage('func caption(place: String) -> String { return place }')).toBe('Swift')
    expect(guessLanguage('def is_overdue(today):\n    return today')).toBe('Python')
    expect(guessLanguage('def label(name)\n  name\nend')).toBe('Ruby')
    expect(guessLanguage('scores <- c(8, 9)\naverage <- mean(scores)')).toBe('R')
    expect(guessLanguage('function seats(guests)\n  return guests\nend')).toBe('Lua')
    expect(guessLanguage('type Order = { count: number }')).toBe('TypeScript')
    expect(guessLanguage('const total = 4\nconsole.log(total)')).toBe('JavaScript')
    expect(guessLanguage('hello neighbor')).toBe('Plain text')
  })
})

describe('stream parsing', () => {
  it('reads the text events and ignores hidden thinking', () => {
    expect(interpretStreamPayload('openai', { type: 'response.output_text.delta', delta: 'Hello' })).toEqual({
      text: 'Hello',
      done: false
    })
    expect(
      interpretStreamPayload('anthropic', {
        type: 'content_block_delta',
        delta: { type: 'thinking_delta', thinking: 'secret' }
      }).text
    ).toBe('')
    expect(
      interpretStreamPayload('anthropic', {
        type: 'content_block_delta',
        delta: { type: 'text_delta', text: 'Hello' }
      }).text
    ).toBe('Hello')
    expect(interpretStreamPayload('openrouter', { choices: [{ delta: { content: 'Hi' }, finish_reason: null }] }).text).toBe(
      'Hi'
    )
    expect(interpretStreamPayload('ollama', { message: { content: 'Hi' }, done: true })).toEqual({
      text: 'Hi',
      done: true
    })
    expect(consumeSseBlock('event: response.output_text.delta\ndata: {"delta":"Hi"}').event).toBe(
      'response.output_text.delta'
    )
  })

  it('reads a finished test reply', () => {
    expect(textFromProviderResponse('openai', { output_text: 'ready' })).toBe('ready')
    expect(textFromProviderResponse('anthropic', { content: [{ type: 'text', text: 'ready' }] })).toBe('ready')
  })
})

describe('errors and catalogs', () => {
  it('hides a key that a provider echoed back', () => {
    const secret = 'sk-test-key-1234'
    expect(redactSecrets(`bad key ${secret}`, [secret])).not.toContain(secret)
    expect(friendlyHttpError(401, { error: { message: secret } }, 'openai', [secret])).toContain('not accepted')
  })

  it('keeps recent text models and drops batch aliases', () => {
    const models = selectOpenRouterModels({
      data: [
        { id: 'openai/gpt-6.1-sol:batch', name: 'batch', created: 5, architecture: { output_modalities: ['text'] } },
        { id: 'openai/gpt-6.1-sol', name: 'OpenAI: GPT-6.1 Sol', created: 4, architecture: { output_modalities: ['text'] } },
        { id: 'vendor/picture', name: 'Picture', created: 9, architecture: { output_modalities: ['image'] } }
      ]
    })
    expect(models.map((model) => model.id)).toEqual(['openai/gpt-6.1-sol'])
  })

  it('reads provider lists', () => {
    expect(selectOllamaModels({ models: [{ name: 'gemma4:31b' }] })[0].id).toBe('gemma4:31b')
    expect(selectOpenAIModels({ data: [{ id: 'gpt-6.1-sol', created: 2 }, { id: 'whisper-1', created: 9 }] }).map((model) => model.id)).toEqual([
      'gpt-6.1-sol'
    ])
    expect(selectAnthropicModels({ data: [{ id: 'claude-sonnet-5-5', display_name: 'Claude Sonnet 5.5' }] })[0].label).toBe(
      'Claude Sonnet 5.5'
    )
  })

  it('describes the active model in plain words', () => {
    const models = defaultModels()
    expect(
      describeModel({ provider: 'anthropic', models, useCustomModel: false, customModel: '' })
    ).toBe('Claude Sonnet 5.5 · Anthropic')
    expect(mergeCatalog([{ id: 'a', label: 'A' }], [{ id: 'a', label: 'Again' }, { id: 'b', label: 'B' }])).toHaveLength(2)
  })
})
