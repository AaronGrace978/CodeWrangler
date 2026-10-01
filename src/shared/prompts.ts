import type { ExplainRequest, ReadingLevel } from './types'
import { LIMITS } from './types'

const VOICE: Record<ReadingLevel, string> = {
  everyday:
    'Write for a neighbor who does not write code. Use short sentences. When you need a technical word, define it in the same sentence. Prefer concrete things: a receipt, a library card, a light switch.',
  curious:
    'Write for a curious beginner. Use the real technical names, and define each one the first time in plain words. Stay warm and direct.',
  teacher:
    'Write for an adult learner who wants the real names and the reason behind the habit. Stay clear and concrete. Do not be cute.'
}

const HEADINGS = [
  'The short version',
  'What it does',
  'How it works',
  'What it is linked to',
  'A habit worth keeping'
]

export function systemPrompt(level: ReadingLevel): string {
  return [
    'You are the voice of CodeWrangler, a book that explains code to regular people.',
    VOICE[level],
    'Only describe what is visible in the page you were given.',
    'Do not invent file names, websites, libraries, or people.',
    'If you are unsure, say so in one sentence.',
    'Use Markdown. Do not wrap the whole answer in a code fence.',
    'Keep the answer about the length of one book page.'
  ].join('\n\n')
}

function fenceLanguage(language: string | undefined): string {
  const name = (language || 'text').trim()
  const known: Record<string, string> = {
    'C#': 'csharp',
    'C++': 'cpp',
    'Plain text': 'text'
  }
  return known[name] ?? name.toLowerCase().replace(/\s+/g, '')
}

function fenced(code: string, language: string | undefined, truncated: boolean): string {
  const note = truncated ? 'The reader pasted a long page. Only the first part is included.\n\n' : ''
  return `${note}\`\`\`${fenceLanguage(language)}\n${code}\n\`\`\``
}

function clip(value: string | undefined, max: number): { text: string; truncated: boolean } {
  const text = (value ?? '').trim()
  if (text.length <= max) return { text, truncated: false }
  return { text: text.slice(0, max), truncated: true }
}

export function userPrompt(request: ExplainRequest): string {
  const code = clip(request.code, LIMITS.code)
  const page = clip(request.pageText, LIMITS.pageText)
  const question = (request.question ?? '').trim()
  const language = request.language?.trim() || 'Plain text'
  const title = request.topicTitle?.trim()

  if (request.task === 'explain-code' || (request.task === 'follow-up' && !question)) {
    return [
      `Read this ${language} page and explain it to a regular person.`,
      `Use these headings, in this order: ${HEADINGS.map((heading) => `"${heading}"`).join(', ')}.`,
      'Under "How it works", use a numbered list. Each item should say what a part of the page does, in everyday words.',
      'Under "What it is linked to", name only the things this page actually depends on or talks to. If it stands alone, say that.',
      '',
      fenced(code.text, language, code.truncated)
    ].join('\n')
  }

  if (request.task === 'follow-up') {
    return [
      `The reader is looking at this ${language} page and asked a question.`,
      'Answer the question. Stay with the code. If you did not see something in the page, say so.',
      '',
      `Question: ${question}`,
      '',
      fenced(code.text, language, code.truncated)
    ].join('\n')
  }

  if (request.task === 'demo') {
    return [
      `The reader just tried a small demo called "${title ?? 'a demo'}".`,
      'The code below is the heart of what they clicked. Explain what they saw, then answer their question if they asked one.',
      'Say what the demo is linked to. This demo lives inside CodeWrangler and does not call a website unless the code says so.',
      '',
      question ? `Question: ${question}` : 'Question: What did I just do, in everyday words?',
      '',
      page.text ? `Printed note already in the book:\n\n${page.text}` : '',
      '',
      fenced(code.text, language, code.truncated)
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (request.task === 'habit') {
    return [
      `The reader is on a page about this habit: ${title ?? 'a coding habit'}.`,
      'The book already says the words below. Add to them, or answer the question, without contradicting the page.',
      'If you add something the page did not say, begin that sentence with "Adding to the page:".',
      '',
      question ? `Question: ${question}` : 'Question: Say the habit another way, with the example.',
      '',
      page.text ? `Printed page:\n\n${page.text}` : '',
      '',
      code.text ? fenced(code.text, language, code.truncated) : ''
    ]
      .filter(Boolean)
      .join('\n')
  }

  return [
    `The reader is on a chapter page titled "${title ?? 'this page'}".`,
    'Answer from the page. If you add something the page did not say, begin that sentence with "Adding to the page:".',
    '',
    question ? `Question: ${question}` : 'Question: Say this page another way, still for a regular person.',
    '',
    page.text ? `Printed page:\n\n${page.text}` : 'The printed page was not included.'
  ].join('\n')
}
