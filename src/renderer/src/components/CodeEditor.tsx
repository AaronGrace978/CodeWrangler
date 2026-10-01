import { useRef } from 'react'

export function CodeEditor({
  code,
  onChange,
  label
}: {
  code: string
  onChange: (value: string) => void
  label: string
}) {
  const gutter = useRef<HTMLDivElement>(null)
  const lines = code.split('\n')
  return (
    <div className="code-editor">
      <div className="gutter" ref={gutter} aria-hidden="true">
        {lines.map((_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>
      <textarea
        className="code-input"
        aria-label={label}
        value={code}
        spellCheck={false}
        wrap="off"
        onScroll={(event) => {
          if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop
        }}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          event.preventDefault()
          const target = event.currentTarget
          const start = target.selectionStart
          const end = target.selectionEnd
          const next = `${code.slice(0, start)}  ${code.slice(end)}`
          onChange(next)
          requestAnimationFrame(() => {
            target.selectionStart = start + 2
            target.selectionEnd = start + 2
          })
        }}
      />
    </div>
  )
}
