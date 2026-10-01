import { bookPage } from '@shared/markdown'

export type Habit = {
  id: string
  title: string
  kicker: string
  language: string
  code: string
  explanation: string
}

export const habits: Habit[] = [
  {
    id: 'names',
    title: 'Names that tell the truth',
    kicker: 'Good habits',
    language: 'JavaScript',
    code: `const x = 4 * 3.5
const muffinTotal = 4 * 3.5
`,
    explanation: bookPage({
      short: 'Both lines hold 14. Only one of them tells you it is muffins.',
      does: 'A name is a promise to the next reader, who may be you in a month. x could be anything. muffinTotal can be read out loud and checked.',
      how: [
        'The first line hides the meaning in a letter. The math is the same, and the meaning is gone.',
        'The second line says what the 14 is for. The numbers can change later without the name becoming a lie, as long as it is still the muffin total.',
        'A good name is dull on purpose. It should sound like the thing on the counter, not like a puzzle.'
      ],
      linked: 'Names are not linked to the computer’s behavior. The program runs either line the same way. The link is to the person who will read the page.',
      habit: 'If you cannot read the name to a neighbor, it is not done yet.'
    })
  },
  {
    id: 'one-job',
    title: 'One job at a time',
    kicker: 'Good habits',
    language: 'JavaScript',
    code: `function priceOfMuffins(count, each) {
  return count * each
}

function withTip(amount, tipRate) {
  return amount + amount * tipRate
}

const due = withTip(priceOfMuffins(4, 3.5), 0.15)
`,
    explanation: bookPage({
      short: 'The price of the muffins is one job. Adding the tip is another.',
      does: 'A function should be easy to describe with one sentence and no “and then.” Here, one function prices the muffins. Another adds a tip to any amount. The last line uses both, in an order a person can follow.',
      how: [
        'priceOfMuffins does not know about tips. That is a virtue. You can reuse it on a day with no tip jar.',
        'withTip does not know about muffins. It can tip a soup order too.',
        'The last line reads in the order of the work: price them, then add the tip. The due amount is 16.10.'
      ],
      linked: 'These functions are linked only to each other, and only because the last line says so. Nothing reaches out to a register unless you add that later.',
      habit: 'When a recipe does two jobs, a change to one job risks the other. Split them while they are still small.'
    })
  },
  {
    id: 'edges',
    title: 'Look at the edges',
    kicker: 'Good habits',
    language: 'JavaScript',
    code: `function bakeryTotal(count, each) {
  if (count < 0 || each < 0) {
    return 0
  }
  const treats = count * each
  const tip = treats * 0.15
  return treats + tip
}
`,
    explanation: bookPage({
      short: 'A negative muffin count is not a sale. The page refuses it.',
      does: 'The edges of a page are the odd cases: nothing, zero, a missing name, a number below zero. Ordinary days are easy. The edges are where a program surprises someone.',
      how: [
        'The if asks whether the count or the price is below zero. || means “or.”',
        'If either is negative, the function returns 0 and stops. It does not invent a refund by accident.',
        'The rest of the page is the ordinary day: multiply, take 15% for the tip, and add them.',
        'Zero muffins is allowed. The total is zero, which is honest. A negative count is not a kind of zero. It is a mistake, so it is stopped.'
      ],
      linked: 'Nothing outside this function is involved. If a button on a website sends the count, that button is where a person could type a minus by mistake. This function is the backstop.',
      habit: 'Before you trust a page, try the empty case and the nonsense case. Ask, “What should a person see then?”'
    })
  },
  {
    id: 'once',
    title: 'Say the rule once',
    kicker: 'Good habits',
    language: 'JavaScript',
    code: `const tipRate = 0.15

function withTip(amount) {
  return amount + amount * tipRate
}

const muffins = withTip(14)
const soup = withTip(8)
`,
    explanation: bookPage({
      short: 'The tip is 15% in one place. Muffins and soup both use that rule.',
      does: 'If the same number is copied into many lines, a change has to be hunted down. One named rule can be reused. People call this “don’t repeat yourself.” The plain version is: say it once.',
      how: [
        'tipRate holds 0.15, which is 15%. The name says what the number means.',
        'withTip uses that one rate. Muffins at $14 become $16.10. Soup at $8 becomes $9.20.',
        'If the shop moves to 18%, you change the one box. Both orders follow.'
      ],
      linked: 'The two orders are linked to the same rate. They are not linked to a settings screen unless you build one. Today the rate is a line at the top of the page.',
      habit: 'When you paste a block for the second time, stop and give the shared part a name.'
    })
  },
  {
    id: 'secrets',
    title: 'Secrets stay off the page',
    kicker: 'Good habits',
    language: 'JavaScript',
    code: `// A key written here can be copied by anyone who sees the file.
const pastedKey = "paste-the-real-key-here"

// A better page reads the key from outside the file.
const apiKey = process.env.BAKERY_KEY
`,
    explanation: bookPage({
      short: 'A password does not belong in the page. It belongs somewhere the page can ask, and a stranger cannot read.',
      does: 'Code is often copied, shared, and published. A key written in the file travels with it. Then anyone with the file can spend your account. CodeWrangler keeps provider keys in Settings, on this computer, instead of writing them into the book.',
      how: [
        'The first line is the habit to avoid. Even a fake-looking key teaches the wrong shape. Do not put the real one in quotes.',
        'process.env means “the environment,” a set of named values the computer holds outside the file. BAKERY_KEY is the name of one of them.',
        'The program reads the key when it runs. The source page only knows the name of the box, not the secret inside.',
        'If a key was pasted by mistake, the kind act is to revoke it at the provider and make a new one. Deleting the line is not enough if the file was already shared.'
      ],
      linked: 'A real key is linked to a provider’s account and its bill. The name BAKERY_KEY is linked to the environment of the computer that runs the page. CodeWrangler’s own keys are linked to Settings on this computer, and they are sent only to the provider you chose, as the password for that request.',
      habit: 'If a stranger could do harm with a string of characters, that string does not go in the source.'
    })
  },
  {
    id: 'notes',
    title: 'Leave a note a person can use',
    kicker: 'Good habits',
    language: 'JavaScript',
    code: `// 15% is the jar on the counter, not the tax.
const tipRate = 0.15

function withTip(amount) {
  return amount + amount * tipRate
}
`,
    explanation: bookPage({
      short: 'The comment says why 15% is there. It does not repeat what the next line already says.',
      does: 'A comment is a note to a person. The computer ignores it. The useful kind explains a reason that the code cannot say by itself: a house rule, a surprise, a warning. The weak kind narrates the obvious.',
      how: [
        'The note says the 15% is the tip jar, not the sales tax. Without it, a reader might “fix” the number and break the shop’s rule.',
        'tipRate already says it is a tip rate. The comment does not need to say “this variable sets the tip rate.”',
        'A README at the front of a project is the same kindness at a larger size. It says what the thing is and how to start.',
        'A commit message is a note on a save. “Update” says nothing. “Keep the counter tip separate from tax” says what changed and why.'
      ],
      linked: 'Comments are linked to the reader, not to a server. On GitHub, the README is linked to the front of the repository, and commit messages are linked to the history of saves.',
      habit: 'Write the note you will wish you had on a tired evening. Then stop. A page full of notes can hide the code.'
    })
  }
]
