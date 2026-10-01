import type { ReadingLevel, SectionId } from './book'
import type { ExplainRequest } from '@shared/types'
import { aiPages, githubPages } from './content/chapters'
import { demos } from './content/demos'
import { habits } from './content/habits'
import { samples } from './content/samples'

export function buildRequest(input: {
  section: SectionId
  index: number
  readingLevel: ReadingLevel
  code: string
  language: string
  question: string
  follow: boolean
}): ExplainRequest | { error: string } {
  const question = input.question.trim()
  if (input.follow && !question) {
    return { error: 'Type a question about this page, then ask.' }
  }
  if (input.section === 'welcome') {
    return { error: 'This page is already written for you. Turn to Your code when you want a model to read a page.' }
  }

  if (input.section === 'code' || input.section === 'languages') {
    if (!input.code.trim()) return { error: 'The left page is empty. Paste some code, then ask again.' }
    return {
      task: input.follow ? 'follow-up' : 'explain-code',
      readingLevel: input.readingLevel,
      code: input.code,
      language: input.language,
      question: input.follow ? question : undefined
    }
  }

  if (input.section === 'demos') {
    const demo = demos[input.index]
    return {
      task: 'demo',
      readingLevel: input.readingLevel,
      code: demo.code,
      language: 'JavaScript',
      topicTitle: demo.title,
      pageText: demo.explanation,
      question: input.follow ? question : 'What did I just do, in everyday words?'
    }
  }

  if (input.section === 'habits') {
    const habit = habits[input.index]
    return {
      task: 'habit',
      readingLevel: input.readingLevel,
      code: habit.code,
      language: habit.language,
      topicTitle: habit.title,
      pageText: habit.explanation,
      question: input.follow ? question : 'Say this habit another way, using the example.'
    }
  }

  const page = (input.section === 'github' ? githubPages : aiPages)[input.index]
  return {
    task: 'chapter',
    readingLevel: input.readingLevel,
    topicTitle: page.title,
    pageText: page.body,
    question: input.follow ? question : 'Say this page another way, still for a regular person.'
  }
}
