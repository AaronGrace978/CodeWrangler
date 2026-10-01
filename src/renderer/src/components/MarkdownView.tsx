import type { JSX } from 'react'
import { parseMarkdown, type Block } from '@shared/markdown'
import { safeHttpsUrl } from '@shared/links'

function inline(text: string): JSX.Element[] {
  const nodes: JSX.Element[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https:\/\/[^)\s]+\))/g
  let last = 0
  let key = 0
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(<span key={key}>{text.slice(last, index)}</span>)
    key += 1
    const token = match[0]
    if (token.startsWith('**')) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    else if (token.startsWith('`')) nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    else if (token.startsWith('*')) nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    else {
      const link = /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/.exec(token)
      if (link) {
        const href = safeHttpsUrl(link[2])
        nodes.push(
          <a
            key={key}
            href={href ?? undefined}
            onClick={(event) => {
              if (!href) return
              event.preventDefault()
              void window.codewrangler?.openLink(href)
            }}
          >
            {link[1]}
          </a>
        )
      }
    }
    key += 1
    last = index + token.length
  }
  if (last < text.length) nodes.push(<span key={key}>{text.slice(last)}</span>)
  return nodes
}

function BlockView({ block }: { block: Block }) {
  if (block.type === 'h') {
    if (block.level === 1) return <h3>{inline(block.text)}</h3>
    if (block.level === 2) return <h3>{inline(block.text)}</h3>
    return <h4>{inline(block.text)}</h4>
  }
  if (block.type === 'ul') {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ul>
    )
  }
  if (block.type === 'ol') {
    return (
      <ol>
        {block.items.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ol>
    )
  }
  if (block.type === 'code') {
    return <pre className="prose-code">{block.text}</pre>
  }
  if (block.type === 'hr') return <hr />
  return <p>{inline(block.text)}</p>
}

export function MarkdownView({ source }: { source: string }) {
  const blocks = parseMarkdown(source)
  return (
    <div className="prose">
      {blocks.map((block, index) => (
        <BlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  )
}
