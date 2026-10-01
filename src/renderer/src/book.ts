import { aiPages, githubPages } from './content/chapters'
import { demos } from './content/demos'
import { habits } from './content/habits'
import { samples } from './content/samples'

export type SectionId = 'welcome' | 'code' | 'languages' | 'demos' | 'habits' | 'github' | 'ai'

export type SpreadRef = {
  section: SectionId
  index: number
  label: string
}

export const chapters: { id: SectionId; label: string; count: number }[] = [
  { id: 'welcome', label: 'Welcome', count: 1 },
  { id: 'code', label: 'Your code', count: 1 },
  { id: 'languages', label: 'Languages', count: samples.length },
  { id: 'demos', label: 'Demos', count: demos.length },
  { id: 'habits', label: 'Good habits', count: habits.length },
  { id: 'github', label: 'GitHub', count: githubPages.length },
  { id: 'ai', label: 'How AI works', count: aiPages.length }
]

export const spreads: SpreadRef[] = chapters.flatMap((chapter) =>
  Array.from({ length: chapter.count }, (_, index) => ({
    section: chapter.id,
    index,
    label: chapter.label
  }))
)

export function positionOf(section: SectionId, index: number): number {
  const found = spreads.findIndex((spread) => spread.section === section && spread.index === index)
  return found < 0 ? 0 : found
}

export type ReadingLevel = 'everyday' | 'curious' | 'teacher'
