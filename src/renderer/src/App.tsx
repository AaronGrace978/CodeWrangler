import { useEffect, useRef, useState } from 'react'
import { describeModel } from '@shared/catalog'
import { guessLanguage } from '@shared/guess'
import type { PublicSettings, ReadingLevel } from '@shared/types'
import { chapters, positionOf, spreads, type SectionId } from './book'
import { SettingsDialog } from './components/SettingsDialog'
import { SpreadView } from './components/Spread'
import { samples, starterSample } from './content/samples'
import { buildRequest } from './requests'

const voices: { id: ReadingLevel; label: string }[] = [
  { id: 'everyday', label: 'Everyday words' },
  { id: 'curious', label: 'Curious beginner' },
  { id: 'teacher', label: 'A teacher’s detail' }
]

function currentCode(
  section: SectionId,
  index: number,
  code: string,
  edits: Record<string, string>
): string {
  if (section === 'code') return code
  if (section === 'languages') {
    const sample = samples[index]
    return edits[sample.id] ?? sample.code
  }
  return ''
}

export function App() {
  const [pos, setPos] = useState(0)
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [level, setLevel] = useState<ReadingLevel>('everyday')
  const [code, setCode] = useState(starterSample.code)
  const [language, setLanguage] = useState(starterSample.language)
  const [languageTouched, setLanguageTouched] = useState(false)
  const [codeDirty, setCodeDirty] = useState(false)
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<Record<string, { text: string; model: string }>>({})
  const [answeredCode, setAnsweredCode] = useState<Record<string, string>>({})
  const [views, setViews] = useState<Record<string, 'book' | 'model'>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [question, setQuestion] = useState('')
  const [streamingKey, setStreamingKey] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const buffer = useRef('')
  const streamKey = useRef<string | null>(null)
  const prompted = useRef(false)
  const spread = spreads[pos]
  const pageKey = `${spread.section}:${spread.index}`

  useEffect(() => {
    const api = window.codewrangler
    if (!api) return
    void api.getSettings().then((next) => {
      setSettings(next)
      setLevel(next.readingLevel)
    })
    return api.onOpenSettings(() => setSettingsOpen(true))
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (settingsOpen) return
      const target = event.target
      if (target instanceof HTMLElement) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        turn(1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        turn(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function turn(delta: number) {
    setPos((current) => {
      const next = Math.max(0, Math.min(spreads.length - 1, current + delta))
      if (next !== current && streamKey.current) void window.codewrangler?.cancelExplain()
      return next
    })
    setQuestion('')
  }

  function go(section: SectionId, index = 0) {
    if (streamKey.current) void window.codewrangler?.cancelExplain()
    setPos(positionOf(section, index))
    setQuestion('')
  }

  async function run(follow: boolean, asked = question) {
    const signature = currentCode(spread.section, spread.index, code, edits)
    const languageName =
      spread.section === 'languages' ? samples[spread.index].language : spread.section === 'code' ? language : 'JavaScript'
    const request = buildRequest({
      section: spread.section,
      index: spread.index,
      readingLevel: level,
      code: signature || (spread.section === 'languages' ? samples[spread.index].code : code),
      language: languageName,
      question: asked,
      follow
    })
    if ('error' in request) {
      setErrors((prev) => ({ ...prev, [pageKey]: request.error }))
      setStatus(request.error)
      return
    }
    const api = window.codewrangler
    if (!api) {
      const message = 'Asking a model happens in the CodeWrangler app, so the key can stay on this computer. You can still read every printed page.'
      setErrors((prev) => ({ ...prev, [pageKey]: message }))
      setStatus(message)
      return
    }
    if (settings && !settings.keys[settings.provider].saved) {
      const message = 'Add a key in Settings to ask a model. The printed page is still here to read.'
      setErrors((prev) => ({ ...prev, [pageKey]: message }))
      setStatus(message)
      if (!prompted.current) {
        prompted.current = true
        setSettingsOpen(true)
      }
      return
    }
    const modelLabel = settings?.activeModelLabel ?? 'the model'
    buffer.current = ''
    streamKey.current = pageKey
    setStreamingKey(pageKey)
    setErrors((prev) => ({ ...prev, [pageKey]: '' }))
    setAnswers((prev) => ({ ...prev, [pageKey]: { text: '', model: modelLabel } }))
    setAnsweredCode((prev) => ({ ...prev, [pageKey]: signature }))
    setViews((prev) => ({ ...prev, [pageKey]: 'model' }))
    setStatus('Writing the page.')
    const off = api.onChunk((chunk) => {
      if (streamKey.current !== pageKey) return
      buffer.current += chunk
      const text = buffer.current
      setAnswers((prev) => ({ ...prev, [pageKey]: { text, model: modelLabel } }))
    })
    try {
      const result = await api.explain(request)
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [pageKey]: result.message }))
        setStatus(result.message)
        if (!buffer.current) setViews((prev) => ({ ...prev, [pageKey]: 'book' }))
      } else if (result.cancelled) {
        setStatus(buffer.current ? 'Stopped. The lines already written are still on the page.' : 'Stopped.')
      } else {
        setStatus('The explanation is ready.')
      }
    } finally {
      off()
      if (streamKey.current === pageKey) {
        streamKey.current = null
        setStreamingKey(null)
      }
    }
  }

  const answer = answers[pageKey]
  const modelLabel = settings
    ? describeModel(settings)
    : 'Choose a model in Settings'

  return (
    <div className="desk">
      <header className="mast">
        <div>
          <p className="kicker light">A book for regular people</p>
          <h1>CodeWrangler</h1>
          <p className="byline">Created by Aaron Grace, M.Ed.</p>
        </div>
        <div className="mast-actions">
          <label>
            Reading voice
            <select
              value={level}
              onChange={(event) => {
                const next = event.target.value as ReadingLevel
                setLevel(next)
                if (!window.codewrangler) return
                void window.codewrangler.saveSettings({ readingLevel: next }).then(setSettings)
              }}
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="settings-button" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
          <p className="key-state">{settings?.keys[settings.provider].saved ? `Key saved · ${modelLabel}` : 'No key yet'}</p>
        </div>
      </header>
      <nav className="chapters" aria-label="Chapters">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            aria-current={spread.section === chapter.id ? 'page' : undefined}
            onClick={() => go(chapter.id, spread.section === chapter.id ? spread.index : 0)}
          >
            {chapter.label}
          </button>
        ))}
      </nav>
      <div className="stage-wrap">
        <div className="cover">
          <SpreadView
            spread={spread}
            leftNumber={pos * 2 + 1}
            rightNumber={pos * 2 + 2}
            code={code}
            language={language}
            codeDirty={codeDirty}
            sampleCode={(id, original) => edits[id] ?? original}
            answer={answer}
            answeredCode={answeredCode[pageKey]}
            showModel={views[pageKey] === 'model'}
            streaming={streamingKey === pageKey}
            error={errors[pageKey]}
            question={question}
            modelLabel={modelLabel}
            onCode={(value) => {
              setCode(value)
              setCodeDirty(value !== starterSample.code)
              if (!languageTouched) setLanguage(guessLanguage(value))
            }}
            onLanguage={(value) => {
              setLanguageTouched(true)
              setLanguage(value)
            }}
            onRestoreStarter={() => {
              setCode(starterSample.code)
              setLanguage(starterSample.language)
              setLanguageTouched(false)
              setCodeDirty(false)
            }}
            onSample={(id, value) => setEdits((prev) => ({ ...prev, [id]: value }))}
            onQuestion={setQuestion}
            onExplain={() => void run(false, '')}
            onFollow={(asked) => {
              setQuestion(asked)
              void run(true, asked)
            }}
            onStop={() => void window.codewrangler?.cancelExplain()}
            onShowBook={() => setViews((prev) => ({ ...prev, [pageKey]: 'book' }))}
            onShowModel={() => setViews((prev) => ({ ...prev, [pageKey]: 'model' }))}
            onJump={(index) => go(spread.section, index)}
          />
          <div className="turner">
            <button type="button" onClick={() => turn(-1)} disabled={pos === 0}>
              Previous page
            </button>
            <div>
              <p>
                {spread.label} · pages {pos * 2 + 1}–{pos * 2 + 2}
                <span className="fine"> Arrow keys turn the page</span>
              </p>
              <p className="reply-live" role="status">
                {status}
              </p>
            </div>
            <button type="button" onClick={() => turn(1)} disabled={pos === spreads.length - 1}>
              Next page
            </button>
          </div>
        </div>
      </div>
      <SettingsDialog open={settingsOpen} settings={settings} onClose={() => setSettingsOpen(false)} onSaved={setSettings} />
    </div>
  )
}
