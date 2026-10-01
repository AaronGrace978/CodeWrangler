export type FigureId =
  | 'welcome'
  | 'folder'
  | 'repo'
  | 'commit'
  | 'branch'
  | 'pull-request'
  | 'issue'
  | 'readme'
  | 'release'
  | 'guesser'
  | 'tokens'
  | 'providers'
  | 'key'
  | 'leaves'
  | 'reader'

export type ChapterPage = {
  id: string
  title: string
  kicker: string
  caption: string
  figure: FigureId
  body: string
}

export const githubPages: ChapterPage[] = [
  {
    id: 'idea',
    title: 'A folder that remembers',
    kicker: 'How GitHub works',
    caption: 'A project folder, and the saves underneath it.',
    figure: 'folder',
    body: `GitHub is a place on the internet for a project folder that remembers every saved version.

People use it so they do not have to email files named final, final-2, and final-really.

The folder can hold code, a recipe, a syllabus, or the pages of a book like this one. GitHub does not care that the files are code. It cares that a group of people can share one history.

You can look at a project without an account. To save a change of your own, you need a free account and a copy of the project.`
  },
  {
    id: 'repo',
    title: 'The repository',
    kicker: 'How GitHub works',
    caption: 'One project: files, history, and conversation.',
    figure: 'repo',
    body: `A repository is the project itself. People shorten the word to “repo.”

It holds three things at once. The files, as they are today. The history of how they got that way. And the conversation around them: questions, suggestions, and decisions.

CodeWrangler lives in a repository. So does almost every public project you can install from GitHub.

If you can open the files and read a first page that says what the project is for, you already know the most important part of a repository. The buttons around it are extra doors into the same project.`
  },
  {
    id: 'commit',
    title: 'A commit is a save with a sentence',
    kicker: 'How GitHub works',
    caption: 'Each save has a note, a name, and a time.',
    figure: 'commit',
    body: `A commit is a save point. It is a snapshot of the files, plus a sentence about what changed, plus the name of the person and the time.

The sentence is the part regular people should care about. “Update” is a wasted note. “Explain the bakery total in everyday words” tells the next person where to look.

Commits stack. You can walk backward through them the way you flip to an earlier draft. Nothing magical happens. The project is remembering on purpose.

You do not need to commit after every keystroke. Commit when the page is in a state you would be willing to return to.`
  },
  {
    id: 'branch',
    title: 'A branch is a parallel draft',
    kicker: 'How GitHub works',
    caption: 'main stays put while a draft tries an idea.',
    figure: 'branch',
    body: `A branch is a parallel draft of the project.

The draft people trust is often named main. It is the copy you would hand to a newcomer. If you want to try an idea, you make a branch so you are not scribbling on main.

The idea might be a new chapter, a bug fix, or a wild experiment. The branch can be messy while you work. main does not have to be.

When the draft is good, you ask to fold it back into main. Until then, the two copies live side by side, with a shared past and a different present.`
  },
  {
    id: 'pr',
    title: 'A pull request is a polite ask',
    kicker: 'How GitHub works',
    caption: 'Please look at this draft before it joins main.',
    figure: 'pull-request',
    body: `A pull request is a request: please look at my draft, talk about it, and fold it into main if it belongs there.

People say “PR” for short. The name is old and a little odd. You can ignore the word pull. It means “please take my changes.”

The request shows what is different, line by line. Reviewers can comment on a line, ask for a change, or approve it. The conversation stays next to the change, so you do not hunt through email.

A pull request is not a test you can pass or fail as a person. It is a review of a draft. Kind reviews talk about the page, not about the author.`
  },
  {
    id: 'issue',
    title: 'An issue is a conversation',
    kicker: 'How GitHub works',
    caption: 'A written note about something to fix, try, or decide.',
    figure: 'issue',
    body: `An issue is a note about work. It might be a bug, a wish, or a question that needs a decision.

The word sounds like blame. It is not. An issue can be good news: “Add a chapter on commits for people who have never used GitHub.”

Issues are how a project remembers what it meant to do. A closed issue is not a failure. It means the conversation reached an end. Sometimes the end is “we will not do this, and here is why.”

If you open an issue, say what you hoped would happen, what happened instead, and what you already tried. That is enough.`
  },
  {
    id: 'readme',
    title: 'The README is the cover letter',
    kicker: 'How GitHub works',
    caption: 'The first page a visitor should be able to read.',
    figure: 'readme',
    body: `A README is the first page of the repository. The name means “read me.”

It should say what the project is, who it is for, and how to start, in plain language. A newcomer should not have to already be an expert to survive the first screen.

GitHub shows the README on the front of the project. It is usually written in Markdown, the simple marks you can sample in the Languages chapter.

If a project’s first page is only a logo and a joke, the project is being rude to strangers. CodeWrangler’s first page is written for regular people on purpose.`
  },
  {
    id: 'release',
    title: 'A release is a packed version',
    kicker: 'How GitHub works',
    caption: 'A named version people can download.',
    figure: 'release',
    body: `A release is a packed-up version of a project, with a name such as v1.0.0, and files people can download.

The name is called a tag. It points at one commit and says, “this save is the version we are handing out.” Later saves do not change that packed version. They wait for a newer tag.

CodeWrangler’s release is built for three kinds of computers: Mac, Windows, and Linux. A helper on GitHub, called Actions, does the packing when the version tag is pushed. You do not have to own all three computers to offer all three downloads.

The first time you open an app from a small project, your computer may ask you to confirm. That is the computer being careful, because the app was not signed with a paid certificate from Apple or Microsoft. The files are still the ones built from this project.`
  }
]

export const aiPages: ChapterPage[] = [
  {
    id: 'guesser',
    title: 'A very well-read guesser',
    kicker: 'How AI works',
    caption: 'A model writes a likely next sentence. It is not a person in the machine.',
    figure: 'guesser',
    body: `In this book, AI means a language model. That is a program that has practiced on a huge amount of text and got good at continuing it.

It does not look over your shoulder. It does not know your files unless you show them. When you ask for an explanation, you are showing it one page.

The reply can be clear, kind, and wrong. The model is guessing a helpful continuation. It is not remembering your project the way a colleague would, and it does not have a stake in telling the truth.

Read it the way you would read a sharp student who sometimes invents a detail rather than say “I don’t know.”`
  },
  {
    id: 'tokens',
    title: 'Tokens are pieces of words',
    kicker: 'How AI works',
    caption: 'The model reads text in small pieces, and those pieces are what get counted.',
    figure: 'tokens',
    body: `Models do not read a page as a single lump. They read tokens. A token is often a word, or part of a word, or a mark such as a period.

A short function might be a few dozen tokens. A whole program can be thousands. Providers charge by tokens, the way a print shop might charge by pages. Longer pages cost more, and a longer reply costs more.

That is why CodeWrangler sends one page, not your entire computer. It also asks the model to keep the reply about the length of a book page.

You do not need to count tokens to use this book. You only need to know that a huge paste is more expensive and easier to misunderstand than a small, whole example.`
  },
  {
    id: 'providers',
    title: 'A provider is a company that runs a model',
    kicker: 'How AI works',
    caption: 'Four doors. Different companies. The book can use any one of them.',
    figure: 'providers',
    body: `A provider is the company that runs the model and keeps the meter.

OpenAI runs the GPT models, including GPT-6.1 Sol, GPT-6 Luna, and GPT-6 Astra.

Anthropic runs Claude, including Sonnet, Opus, Fable, and Haiku.

OpenRouter is a switchboard. One key there can reach recent models from many companies, including the ones above and others such as Gemini, Grok, DeepSeek, and Qwen.

Ollama Cloud runs models hosted by Ollama, such as Gemma and gpt-oss. You do not download those models onto this computer. CodeWrangler sends the page to Ollama’s cloud.

The printed chapters of this book do not need any of them. A key is only for the moments when you ask a model to write the right-hand page.`
  },
  {
    id: 'key',
    title: 'The key stays on this computer',
    kicker: 'How AI works',
    caption: 'A key is a password for a provider’s meter.',
    figure: 'key',
    body: `A key is a password for the provider’s meter. Anyone who has it can spend your account. Treat it like a house key.

CodeWrangler stores it in Settings, on this computer. When the operating system allows it, the key is locked so other programs cannot read the settings file as plain text. The key is not written into the source of this book, and it is not part of a project you might publish.

You can remove a key in Settings. If you think someone else saw it, revoke it on the provider’s website and make a new one. Deleting it here does not rewind a copy someone already took.

CodeWrangler does not have an account of its own to bill you. The provider does.`
  },
  {
    id: 'leaves',
    title: 'What leaves this computer',
    kicker: 'How AI works',
    caption: 'Nothing is sent until you ask. Then one page goes to the provider you chose.',
    figure: 'leaves',
    body: `Turning pages does not send anything. Reading a sample, a demo, or a chapter stays on this computer.

When you press the button to ask a model, CodeWrangler sends three kinds of text. The instructions for how to explain, including the reading voice you chose. The page on the left, or the chapter you are reading. And your question, if you typed one.

It sends them to the provider you picked in Settings. It sends your key only to that provider, as the password for the request. It does not send the key to the other providers, and it does not send a folder of your other files.

If you do not press the button, the model never sees the page.`
  },
  {
    id: 'reader',
    title: 'How to read an answer',
    kicker: 'How AI works',
    caption: 'Check the answer against the left page.',
    figure: 'reader',
    body: `Start with the left page, not the answer. You already have the real thing in front of you.

Then read the right page and ask three questions. Does it name something that is not on the left? Does the “linked to” section invent a website, a file, or a library? Does the short version match what you can see?

If the answer is foggy, ask it to say the same thing more simply. If it is too sure, ask what it is unsure about. Changing the reading voice in Settings changes the tone: everyday words, a curious beginner, or a teacher’s detail.

The model is a guest author. The book, and you, get the last word.`
  }
]
