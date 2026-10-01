import type { JSX } from 'react'
import type { FigureId } from '../content/chapters'

function Sketch({ label, children }: { label: string; children: JSX.Element | JSX.Element[] }) {
  return (
    <div className="sketch" role="img" aria-label={label}>
      {children}
    </div>
  )
}

function Box({ title, detail, tone = 'paper' }: { title: string; detail: string; tone?: 'paper' | 'ink' | 'cloth' }) {
  return (
    <div className={`sketch-box tone-${tone}`}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  )
}

function Arrow({ children }: { children: string }) {
  return <div className="sketch-arrow">{children}</div>
}

export function Figure({ id }: { id: FigureId }) {
  switch (id) {
    case 'welcome':
      return (
        <Sketch label="Two facing pages. The left says code. The right says everyday words.">
          <Box title="Left page" detail="The code, as it is written." />
          <Arrow>means</Arrow>
          <Box title="Right page" detail="What a person can say out loud." tone="cloth" />
        </Sketch>
      )
    case 'folder':
      return (
        <Sketch label="A project folder with three saved versions under it.">
          <Box title="Project folder" detail="Recipes, notes, or code." />
          <Arrow>remembers</Arrow>
          <div className="sketch-stack">
            <Box title="Save 1" detail="Add the soup recipe" />
            <Box title="Save 2" detail="Fix the missing salt" />
            <Box title="Save 3" detail="Invite Pat to read it" />
          </div>
        </Sketch>
      )
    case 'repo':
      return (
        <Sketch label="A repository holds files, history, and conversation.">
          <Box title="Files" detail="What the project is today." />
          <Box title="History" detail="How it got that way." />
          <Box title="Conversation" detail="Questions and decisions." />
        </Sketch>
      )
    case 'commit':
      return (
        <Sketch label="A commit card with a sentence, a name, and a time.">
          <Box title="“Explain the tip in everyday words.”" detail="Avery · Tuesday, 4:10 p.m." tone="ink" />
        </Sketch>
      )
    case 'branch':
      return (
        <Sketch label="A main line stays put while a side draft tries an idea.">
          <div className="sketch-stack">
            <Box title="main" detail="The draft you would hand to a newcomer." tone="cloth" />
            <Arrow>a side draft</Arrow>
            <Box title="try-a-clearer-title" detail="Messy is allowed over here." />
          </div>
        </Sketch>
      )
    case 'pull-request':
      return (
        <Sketch label="A draft goes to a conversation, and then maybe into main.">
          <Box title="Your draft" detail="The branch with the new pages." />
          <Arrow>please look</Arrow>
          <Box title="The conversation" detail="Comments on the lines that changed." tone="ink" />
          <Arrow>if it belongs</Arrow>
          <Box title="main" detail="The shared copy." tone="cloth" />
        </Sketch>
      )
    case 'issue':
      return (
        <Sketch label="A note that says what you hoped, what happened, and what you tried.">
          <Box title="Add a chapter on commits" detail="Hoped for a plain explanation. Tried the glossary first." />
        </Sketch>
      )
    case 'readme':
      return (
        <Sketch label="A cover page titled Read me, with three short promises.">
          <Box title="Read me" detail="What it is. Who it is for. How to start." tone="ink" />
        </Sketch>
      )
    case 'release':
      return (
        <Sketch label="Version 1.0.0 packed for Mac, Windows, and Linux.">
          <Box title="v1.0.0" detail="One saved moment, named." tone="cloth" />
          <Arrow>packed for</Arrow>
          <div className="sketch-stack">
            <Box title="Mac" detail="A disk image." />
            <Box title="Windows" detail="An installer." />
            <Box title="Linux" detail="An AppImage and a deb." />
          </div>
        </Sketch>
      )
    case 'guesser':
      return (
        <Sketch label="A page goes in. A likely explanation comes out. The model is not a person.">
          <Box title="The page you showed" detail="Only what is on the left." />
          <Arrow>guesses</Arrow>
          <Box title="A likely reply" detail="Helpful, and sometimes wrong." tone="ink" />
        </Sketch>
      )
    case 'tokens':
      return (
        <Sketch label="The sentence Please pay sixteen dollars, broken into small pieces.">
          <div className="token-row">
            {['Please', ' pay', ' sixteen', ' dollars', '.'] .map((token) => (
              <span key={token} className="token">{token}</span>
            ))}
          </div>
        </Sketch>
      )
    case 'providers':
      return (
        <Sketch label="Four providers: OpenAI, Anthropic, OpenRouter, and Ollama Cloud.">
          <Box title="OpenAI" detail="GPT models" />
          <Box title="Anthropic" detail="Claude" />
          <Box title="OpenRouter" detail="Many recent models" />
          <Box title="Ollama Cloud" detail="Hosted models" />
        </Sketch>
      )
    case 'key':
      return (
        <Sketch label="A key stays in Settings on this computer. It is not printed in the book.">
          <Box title="Settings" detail="The key stays here." tone="cloth" />
          <Arrow>not in</Arrow>
          <Box title="The book" detail="No passwords on the page." />
        </Sketch>
      )
    case 'leaves':
      return (
        <Sketch label="This computer sends one page to the provider you chose, and only after you ask.">
          <Box title="This computer" detail="The page, the question, the instructions." />
          <Arrow>only if you ask</Arrow>
          <Box title="The provider you chose" detail="No other files go with it." tone="ink" />
        </Sketch>
      )
    case 'reader':
      return (
        <Sketch label="Check the answer against the left page before you trust it.">
          <Box title="Left page" detail="The real thing." tone="cloth" />
          <Arrow>check</Arrow>
          <Box title="Right page" detail="Did it invent a file or a website?" />
        </Sketch>
      )
    default:
      return null
  }
}
