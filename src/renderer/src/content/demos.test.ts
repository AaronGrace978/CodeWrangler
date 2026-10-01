import { describe, expect, it } from 'vitest'
import { demos, totalWithTip, addCoin, choresLeft, flip } from './demos'
import { samples } from './samples'

describe('demos stay honest', () => {
  it('uses the same tip math the page shows', () => {
    expect(totalWithTip(28, 15)).toBeCloseTo(32.2)
    expect(samples.find((sample) => sample.id === 'javascript')?.explanation).toContain('$16.10')
    expect(demos[0].code).toContain('bill * (tipPercent / 100)')
    expect(samples.find((sample) => sample.id === 'swift')?.code).toContain('\\(place)')
    expect(samples.find((sample) => sample.id === 'kotlin')?.code).toContain('${warmer(62, 71)}')
  })

  it('keeps the other demo ideas small and checkable', () => {
    expect(addCoin(2)).toBe(3)
    expect(flip(false)).toBe(true)
    expect(choresLeft([{ name: 'Water', done: false }, { name: 'List', done: true }])).toHaveLength(1)
  })
})
