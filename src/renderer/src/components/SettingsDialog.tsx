import { useEffect, useRef, useState } from 'react'
import { PROVIDERS, providerInfo } from '@shared/catalog'
import type { CatalogModel, ProviderId, PublicSettings, ReadingLevel } from '@shared/types'

const VOICES: { id: ReadingLevel; label: string }[] = [
  { id: 'everyday', label: 'Everyday words' },
  { id: 'curious', label: 'Curious beginner' },
  { id: 'teacher', label: 'A teacher’s detail' }
]

function plainError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Settings could not be saved.'
  const marker = 'Error: '
  const index = message.lastIndexOf(marker)
  return index >= 0 ? message.slice(index + marker.length) : message
}

export function SettingsDialog({
  open,
  settings,
  onClose,
  onSaved
}: {
  open: boolean
  settings: PublicSettings | null
  onClose: () => void
  onSaved: (settings: PublicSettings) => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [provider, setProvider] = useState<ProviderId>('openai')
  const [models, setModels] = useState<Record<ProviderId, string>>({
    openai: 'gpt-6.1-sol',
    anthropic: 'claude-sonnet-5-5',
    openrouter: 'anthropic/claude-sonnet-5.5',
    ollama: 'gemma4:31b'
  })
  const [lists, setLists] = useState<Record<ProviderId, CatalogModel[]>>({
    openai: providerInfo('openai').models,
    anthropic: providerInfo('anthropic').models,
    openrouter: providerInfo('openrouter').models,
    ollama: providerInfo('ollama').models
  })
  const [useCustomModel, setUseCustomModel] = useState(false)
  const [customModel, setCustomModel] = useState('')
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('everyday')
  const [keyDraft, setKeyDraft] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open || !settings) return
    setProvider(settings.provider)
    setModels(settings.models)
    setUseCustomModel(settings.useCustomModel)
    setCustomModel(settings.customModel)
    setReadingLevel(settings.readingLevel)
    setKeyDraft('')
    setShowKey(false)
    setStatus('')
  }, [open, settings])

  useEffect(() => {
    if (!open) return
    const node = dialogRef.current
    if (!node) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    node.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = [...node.querySelectorAll<HTMLElement>('button, a, input, select, textarea')].filter(
        (item) => !item.hasAttribute('disabled')
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const info = providerInfo(provider)
  const savedKey = settings?.keys[provider]
  const choices = lists[provider]
  const current = models[provider]
  const options = choices.some((model) => model.id === current) ? choices : [{ id: current, label: current }, ...choices]
  const app = window.codewrangler

  async function save(): Promise<PublicSettings | null> {
    if (!app) {
      setStatus('Settings are kept inside the CodeWrangler app, on this computer.')
      return null
    }
    setBusy(true)
    try {
      const saved = await app.saveSettings({
        provider,
        models,
        useCustomModel,
        customModel,
        readingLevel,
        ...(keyDraft.trim() ? { keys: { [provider]: keyDraft.trim() } } : {})
      })
      onSaved(saved)
      setKeyDraft('')
      setStatus('Saved on this computer.')
      return saved
    } catch (error) {
      setStatus(plainError(error))
      return null
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="scrim" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        ref={dialogRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dialog-head">
          <div>
            <p className="kicker">Settings</p>
            <h2 id="settings-title">How this book asks a model</h2>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="dialog-body">
          <p>
            The printed chapters can be read with no key. A key is only for the moments when a model writes the right-hand
            page. The key stays on this computer. CodeWrangler does not add a fee. The provider you choose may charge for a
            reply.
          </p>
          <fieldset>
            <legend>Provider</legend>
            <div className="provider-grid">
              {PROVIDERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={provider === item.id}
                  className={provider === item.id ? 'provider-card selected' : 'provider-card'}
                  onClick={() => setProvider(item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.blurb}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            Model
            <select
              value={current}
              disabled={useCustomModel}
              onChange={(event) => setModels((prev) => ({ ...prev, [provider]: event.target.value }))}
            >
              {options.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.note ? `${model.label} — ${model.note}` : model.label}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-actions">
            <button
              type="button"
              disabled={!app || busy}
              onClick={() => {
                if (!app) return
                setBusy(true)
                void app
                  .refreshModels(provider)
                  .then((result) => {
                    setLists((prev) => ({ ...prev, [provider]: result.models }))
                    setStatus(result.message ?? 'The model list is up to date.')
                  })
                  .catch((error: unknown) => setStatus(plainError(error)))
                  .finally(() => setBusy(false))
              }}
            >
              Refresh the model list
            </button>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={useCustomModel}
              onChange={(event) => setUseCustomModel(event.target.checked)}
            />
            Use a model id I type
          </label>
          <label>
            Model id
            <input
              value={customModel}
              disabled={!useCustomModel}
              onChange={(event) => setCustomModel(event.target.value)}
              placeholder={info.defaultModel}
              spellCheck={false}
              autoComplete="off"
            />
          </label>
          <p className="fine">{info.keyHelp}</p>
          <p className="fine">
            <a
              href={info.keyUrl}
              onClick={(event) => {
                event.preventDefault()
                void app?.openLink(info.keyUrl)
              }}
            >
              Open the page where {info.label} makes keys
            </a>
          </p>
          <label>
            Key for {info.label}
            <input
              type={showKey ? 'text' : 'password'}
              value={keyDraft}
              onChange={(event) => setKeyDraft(event.target.value)}
              placeholder={savedKey?.saved ? `A key is saved (${savedKey.hint}). Paste a new one to replace it.` : 'Paste the key'}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <div className="inline-actions">
            <button type="button" onClick={() => setShowKey((value) => !value)}>
              {showKey ? 'Hide the key' : 'Show the key'}
            </button>
            {savedKey?.saved && app && (
              <button
                type="button"
                onClick={() => {
                  setBusy(true)
                  void app
                    .saveSettings({ keys: { [provider]: '' } })
                    .then((saved) => {
                      onSaved(saved)
                      setStatus('The saved key was removed from this computer.')
                    })
                    .catch((error: unknown) => setStatus(plainError(error)))
                    .finally(() => setBusy(false))
                }}
              >
                Remove the saved key
              </button>
            )}
          </div>
          <label>
            Reading voice
            <select value={readingLevel} onChange={(event) => setReadingLevel(event.target.value as ReadingLevel)}>
              {VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
          </label>
          <p className="fine">
            The reading voice changes how a model writes. The printed chapters stay in everyday words.
            {settings?.encryption === 'plain'
              ? ' This computer could not lock the key file. The key is stored for your user only.'
              : ' When this computer can, the key is locked so it is not stored as plain text.'}
          </p>
          <p className="fine">Created by Aaron Grace, M.Ed. CodeWrangler {settings?.version ?? '1.0.0'}.</p>
          {status && <p role="status" className="status">{status}</p>}
        </div>
        <footer className="dialog-foot">
          <button type="button" disabled={busy} onClick={() => void save()}>
            Save settings
          </button>
          <button
            type="button"
            className="primary"
            disabled={busy || !app}
            onClick={() => {
              void save().then(async (saved) => {
                if (!saved || !app) return
                if (!saved.keys[saved.provider].saved) {
                  setStatus('Save a key for this provider, then test the connection.')
                  return
                }
                setBusy(true)
                try {
                  const result = await app.testConnection()
                  setStatus(result.message)
                } finally {
                  setBusy(false)
                }
              })
            }}
          >
            Save and test the key
          </button>
        </footer>
      </div>
    </div>
  )
}
