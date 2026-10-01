import { useState, type ReactNode } from 'react'
import type { SpreadRef } from '../book'
import { aiPages, githubPages } from '../content/chapters'
import { demos } from '../content/demos'
import { habits } from '../content/habits'
import { samples } from '../content/samples'
import { CodeEditor } from './CodeEditor'
import { Figure } from './Figures'
import { MarkdownView } from './MarkdownView'

const languages = [...new Set([...samples.map((sample) => sample.language), 'Plain text'])]

export type SpreadProps = {
  spread: SpreadRef
  leftNumber: number
  rightNumber: number
  code: string
  language: string
  codeDirty: boolean
  sampleCode: (id: string, original: string) => string
  answer?: { text: string; model: string }
  answeredCode?: string
  showModel: boolean
  streaming: boolean
  error?: string
  question: string
  modelLabel: string
  onCode: (value: string) => void
  onLanguage: (value: string) => void
  onRestoreStarter: () => void
  onSample: (id: string, value: string) => void
  onQuestion: (value: string) => void
  onExplain: () => void
  onFollow: (question: string) => void
  onStop: () => void
  onShowBook: () => void
  onShowModel: () => void
  onJump: (index: number) => void
}

function Paper({
  side,
  number,
  kicker,
  title,
  children
}: {
  side: 'left' | 'right'
  number: number
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <article className={`page page-${side}`} aria-label={`${title}, page ${number}`}>
      <header className="page-head">
        <p className="kicker">{kicker}</p>
        <h2>{title}</h2>
      </header>
      <div className="page-body">{children}</div>
      <footer className="page-foot">
        <span>{side === 'left' ? 'CodeWrangler' : 'Created by Aaron Grace, M.Ed.'}</span>
        <span className="page-num">{number}</span>
      </footer>
    </article>
  )
}

function Jump({
  label,
  value,
  options,
  onJump
}: {
  label: string
  value: number
  options: { id: string; label: string }[]
  onJump: (index: number) => void
}) {
  return (
    <label className="jump">
      {label}
      <select value={value} onChange={(event) => onJump(Number(event.target.value))}>
        {options.map((option, index) => (
          <option key={option.id} value={index}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Ask({
  primary,
  disabled,
  streaming,
  error,
  question,
  showPrinted,
  showModelButton,
  copyText,
  chips,
  onExplain,
  onFollow,
  onStop,
  onShowBook,
  onShowModel,
  onQuestion
}: {
  primary: string
  disabled?: boolean
  streaming: boolean
  error?: string
  question: string
  showPrinted: boolean
  showModelButton: boolean
  copyText?: string
  chips: string[]
  onExplain: () => void
  onFollow: (question: string) => void
  onStop: () => void
  onShowBook: () => void
  onShowModel: () => void
  onQuestion: (value: string) => void
}) {
  const [copyNote, setCopyNote] = useState('')
  return (
    <div className="ask">
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      <div className="ask-row">
        {streaming ? (
          <button type="button" className="primary" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button type="button" className="primary" onClick={onExplain} disabled={disabled}>
            {primary}
          </button>
        )}
        {showPrinted && (
          <button type="button" onClick={onShowBook}>
            Show the printed page
          </button>
        )}
        {showModelButton && (
          <button type="button" onClick={onShowModel}>
            Show the model page
          </button>
        )}
        {copyText && (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(copyText).then(
                () => setCopyNote('Copied.'),
                () => setCopyNote('Select the page and copy it from the Edit menu.')
              )
            }}
          >
            Copy
          </button>
        )}
      </div>
      <div className="question-row">
        <label>
          Ask about this page
          <input
            value={question}
            onChange={(event) => onQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && question.trim()) onFollow(question)
            }}
          />
        </label>
        <button type="button" onClick={() => onFollow(question)} disabled={!question.trim() || streaming}>
          Ask
        </button>
      </div>
      <div className="chips">
        {chips.map((chip) => (
          <button key={chip} type="button" onClick={() => onFollow(chip)} disabled={streaming}>
            {chip}
          </button>
        ))}
      </div>
      {copyNote && <p className="fine">{copyNote}</p>}
      <p className="fine">
        Asking a model sends this page to the provider in Settings. A provider may charge for the reply. CodeWrangler does
        not.
      </p>
    </div>
  )
}

function RightReading({
  kicker,
  title,
  number,
  printed,
  modelText,
  modelName,
  showModel,
  streaming,
  stale,
  ask
}: {
  kicker: string
  title: string
  number: number
  printed?: string
  modelText?: string
  modelName?: string
  showModel: boolean
  streaming: boolean
  stale: boolean
  ask: ReactNode
}) {
  const showingModel = showModel && (Boolean(modelText) || streaming)
  const source = showingModel ? (streaming ? 'Writing…' : `Written by ${modelName ?? 'the model'}`) : 'Printed in this book'
  const visible = showingModel ? modelText ?? '' : printed ?? ''
  return (
    <Paper side="right" number={number} kicker={source} title={title}>
      <p className="kicker quiet">{kicker}</p>
      {stale && showingModel && (
        <p className="banner">The left page changed after this note was written. Ask again for a fresh reading.</p>
      )}
      {streaming && !modelText && <p className="writing-note">Writing the page…</p>}
      {visible ? <MarkdownView source={visible} /> : <p>This page is waiting for a few lines of code.</p>}
      {ask}
    </Paper>
  )
}

export function SpreadView(props: SpreadProps) {
  const { spread } = props
  const ask = (primary: string, printed: string | undefined, chips: string[], disabled = false) => (
    <Ask
      primary={primary}
      disabled={disabled}
      streaming={props.streaming}
      error={props.error}
      question={props.question}
      showPrinted={props.showModel && Boolean(props.answer?.text)}
      showModelButton={!props.showModel && Boolean(props.answer?.text)}
      copyText={props.showModel ? props.answer?.text : printed}
      chips={chips}
      onExplain={props.onExplain}
      onFollow={props.onFollow}
      onStop={props.onStop}
      onShowBook={props.onShowBook}
      onShowModel={props.onShowModel}
      onQuestion={props.onQuestion}
    />
  )
  const codeChips = ['What is this linked to?', 'What could go wrong?', 'Say it more simply']
  const chapterChips = ['Say this more simply', 'Give me an everyday example', 'What should I remember?']

  if (spread.section === 'welcome') {
    return (
      <>
        <Paper side="left" number={props.leftNumber} kicker="Welcome" title="Open this book anywhere">
          <Figure id="welcome" />
          <div className="prose">
            <p>You do not need a computer degree to read code. You need a page, and a clear sentence about what the page is doing.</p>
            <p>
              CodeWrangler is that book. The left page holds the code. The right page says what it means, in the kind of
              language you would use with a neighbor.
            </p>
            <p>Created by Aaron Grace, M.Ed.</p>
          </div>
        </Paper>
        <div className="spine" aria-hidden="true" />
        <Paper side="right" number={props.rightNumber} kicker="How to read" title="Two pages, one idea">
          <div className="prose">
            <ol>
              <li>Choose a chapter above the book.</li>
              <li>On the left, paste code or turn to a sample.</li>
              <li>On the right, read the plain version.</li>
              <li>Arrow keys turn the page when you are not typing.</li>
            </ol>
            <h3>A model is optional</h3>
            <p>
              The samples, the demos, the habits, and the chapters on GitHub and AI are already printed. You can read the
              whole book with no account.
            </p>
            <p>
              When you want a fresh explanation of your own code, open Settings and add a key for OpenAI, Anthropic,
              OpenRouter, or Ollama Cloud. The key stays on this computer. Nothing is sent until you ask.
            </p>
          </div>
        </Paper>
      </>
    )
  }

  if (spread.section === 'code') {
    const printed = props.codeDirty ? undefined : samples[0].explanation
    return (
      <>
        <Paper side="left" number={props.leftNumber} kicker="Your code" title="The page you want to understand">
          <label className="jump">
            I think this is
            <select value={props.language} onChange={(event) => props.onLanguage(event.target.value)}>
              {languages.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </label>
          <CodeEditor code={props.code} onChange={props.onCode} label="Code to explain" />
          <p className="fine">
            {props.codeDirty
              ? 'You changed the page. The printed note on the right describes the bakery example, until you ask a model.'
              : 'This starts as a bakery receipt, so the book is not blank. Replace it with any code you want to understand.'}
          </p>
          {props.codeDirty && (
            <button type="button" onClick={props.onRestoreStarter}>
              Restore the bakery example
            </button>
          )}
        </Paper>
        <div className="spine" aria-hidden="true" />
        <RightReading
          kicker="Your code"
          title="In everyday words"
          number={props.rightNumber}
          printed={printed ?? 'Paste code on the left, then ask for an explanation. The other chapters can be read with no key at all.'}
          modelText={props.answer?.text}
          modelName={props.answer?.model ?? props.modelLabel}
          showModel={props.showModel}
          streaming={props.streaming}
          stale={Boolean(props.answeredCode && props.answeredCode !== props.code)}
          ask={ask(props.codeDirty || !printed ? 'Explain this page' : 'Ask a model to explain this page', printed, codeChips, !props.code.trim())}
        />
      </>
    )
  }

  if (spread.section === 'languages') {
    const sample = samples[spread.index]
    const code = props.sampleCode(sample.id, sample.code)
    const changed = code !== sample.code
    return (
      <>
        <Paper side="left" number={props.leftNumber} kicker={sample.language} title={sample.title}>
          <Jump
            label="Turn to a language"
            value={spread.index}
            options={samples.map((item) => ({ id: item.id, label: item.language }))}
            onJump={props.onJump}
          />
          <p className="lede">{sample.blurb}</p>
          <CodeEditor code={code} onChange={(value) => props.onSample(sample.id, value)} label={`${sample.language} sample`} />
          {changed && <p className="fine">You changed the sample. The printed note describes the original.</p>}
        </Paper>
        <div className="spine" aria-hidden="true" />
        <RightReading
          kicker={sample.language}
          title="In everyday words"
          number={props.rightNumber}
          printed={sample.explanation}
          modelText={props.answer?.text}
          modelName={props.answer?.model ?? props.modelLabel}
          showModel={props.showModel}
          streaming={props.streaming}
          stale={Boolean(props.answeredCode && props.answeredCode !== code)}
          ask={ask('Ask a model to explain this page', sample.explanation, codeChips)}
        />
      </>
    )
  }

  if (spread.section === 'demos') {
    const demo = demos[spread.index]
    const Stage = demo.Stage
    return (
      <>
        <Paper side="left" number={props.leftNumber} kicker="Try it" title={demo.title}>
          <Jump
            label="Choose a demo"
            value={spread.index}
            options={demos.map((item) => ({ id: item.id, label: item.title }))}
            onJump={props.onJump}
          />
          <Stage />
          <p className="fine">The heart of this demo, written so it can be read aloud.</p>
          <pre className="code-block">{demo.code}</pre>
        </Paper>
        <div className="spine" aria-hidden="true" />
        <RightReading
          kicker="Demo"
          title="What you just did"
          number={props.rightNumber}
          printed={demo.explanation}
          modelText={props.answer?.text}
          modelName={props.answer?.model ?? props.modelLabel}
          showModel={props.showModel}
          streaming={props.streaming}
          stale={false}
          ask={ask('Ask a model about this demo', demo.explanation, codeChips)}
        />
      </>
    )
  }

  if (spread.section === 'habits') {
    const habit = habits[spread.index]
    return (
      <>
        <Paper side="left" number={props.leftNumber} kicker="An example" title={habit.title}>
          <Jump
            label="Choose a habit"
            value={spread.index}
            options={habits.map((item) => ({ id: item.id, label: item.title }))}
            onJump={props.onJump}
          />
          <pre className="code-block">{habit.code}</pre>
        </Paper>
        <div className="spine" aria-hidden="true" />
        <RightReading
          kicker="Good habits"
          title={habit.title}
          number={props.rightNumber}
          printed={habit.explanation}
          modelText={props.answer?.text}
          modelName={props.answer?.model ?? props.modelLabel}
          showModel={props.showModel}
          streaming={props.streaming}
          stale={false}
          ask={ask('Ask a model to say more', habit.explanation, chapterChips)}
        />
      </>
    )
  }

  const pages = spread.section === 'github' ? githubPages : aiPages
  const page = pages[spread.index]
  return (
    <>
      <Paper side="left" number={props.leftNumber} kicker={page.kicker} title={page.title}>
        <Jump
          label="Choose a page"
          value={spread.index}
          options={pages.map((item) => ({ id: item.id, label: item.title }))}
          onJump={props.onJump}
        />
        <Figure id={page.figure} />
        <p className="lede">{page.caption}</p>
      </Paper>
      <div className="spine" aria-hidden="true" />
      <RightReading
        kicker={page.kicker}
        title="In everyday words"
        number={props.rightNumber}
        printed={page.body}
        modelText={props.answer?.text}
        modelName={props.answer?.model ?? props.modelLabel}
        showModel={props.showModel}
        streaming={props.streaming}
        stale={false}
        ask={ask('Ask a model to say this another way', page.body, chapterChips)}
      />
    </>
  )
}
