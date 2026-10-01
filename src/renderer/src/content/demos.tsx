import { useState, type JSX } from 'react'
import { bookPage } from '@shared/markdown'

export function totalWithTip(bill: number, tipPercent: number): number {
  const tip = bill * (tipPercent / 100)
  return bill + tip
}

export function choresLeft(chores: { name: string; done: boolean }[]): { name: string; done: boolean }[] {
  return chores.filter((chore) => !chore.done)
}

export function addCoin(coins: number): number {
  return coins + 1
}

export function flip(on: boolean): boolean {
  return !on
}

export type Demo = {
  id: string
  title: string
  kicker: string
  code: string
  explanation: string
  Stage: () => JSX.Element
}

function TipStage(): JSX.Element {
  const [bill, setBill] = useState('28')
  const [tip, setTip] = useState(15)
  const amount = Number(bill)
  const ready = Number.isFinite(amount) && amount >= 0
  const due = ready ? totalWithTip(amount, tip) : 0
  return (
    <div className="stage">
      <label>
        Bill
        <input
          type="number"
          min="0"
          step="0.01"
          value={bill}
          onChange={(event) => setBill(event.target.value)}
        />
      </label>
      <label>
        Tip {tip}%
        <input type="range" min="0" max="30" value={tip} onChange={(event) => setTip(Number(event.target.value))} />
      </label>
      <p className="stage-result">{ready ? `Please pay $${due.toFixed(2)}` : 'Enter a bill that is zero or more.'}</p>
    </div>
  )
}

function JarStage(): JSX.Element {
  const [coins, setCoins] = useState(0)
  return (
    <div className="stage">
      <p className="stage-result">Coins in the jar: {coins}</p>
      <div className="stage-row">
        <button type="button" onClick={() => setCoins((count) => addCoin(count))}>
          Add a coin
        </button>
        <button type="button" onClick={() => setCoins(0)}>
          Empty the jar
        </button>
      </div>
    </div>
  )
}

const startingChores = [
  { name: 'Water the tomatoes', done: false },
  { name: 'Write the grocery list', done: true },
  { name: 'Return the library book', done: false },
  { name: 'Mend the porch light', done: false }
]

function ChoreStage(): JSX.Element {
  const [chores, setChores] = useState(startingChores)
  const left = choresLeft(chores)
  return (
    <div className="stage">
      <ul className="chore-list">
        {chores.map((chore, index) => (
          <li key={chore.name}>
            <label>
              <input
                type="checkbox"
                checked={chore.done}
                onChange={() =>
                  setChores((current) =>
                    current.map((item, itemIndex) => (itemIndex === index ? { ...item, done: !item.done } : item))
                  )
                }
              />
              {chore.name}
            </label>
          </li>
        ))}
      </ul>
      <p className="stage-result">Still to do: {left.length}</p>
    </div>
  )
}

function LightStage(): JSX.Element {
  const [on, setOn] = useState(false)
  return (
    <div className="stage">
      <div className={on ? 'lamp on' : 'lamp'} role="img" aria-label={on ? 'Porch light on' : 'Porch light off'}>
        <span>{on ? 'On' : 'Off'}</span>
      </div>
      <button type="button" onClick={() => setOn((value) => flip(value))}>
        Flip the switch
      </button>
    </div>
  )
}

export const demos: Demo[] = [
  {
    id: 'tip',
    title: 'A tip on the bill',
    kicker: 'Demos',
    code: `function totalWithTip(bill, tipPercent) {
  const tip = bill * (tipPercent / 100)
  return bill + tip
}

const due = totalWithTip(28, 15)
console.log("Please pay $" + due.toFixed(2))
`,
    explanation: bookPage({
      short: 'A $28 bill with a 15% tip comes to $32.20. Move the slider and the sentence changes.',
      does: 'The little counter above is live. The code under it is the heart of what just happened. The app around it is busier. This is the part worth reading.',
      how: [
        'totalWithTip takes the bill and the tip percent. Percent means “out of 100,” so the page divides by 100 before it multiplies.',
        'tip is only the extra amount. The return line adds it back onto the bill. That sum is what you pay.',
        'The example uses 28 and 15. The slider on this page uses whatever you chose, and the same recipe.',
        'toFixed(2) keeps two digits for cents when the sentence is written.'
      ],
      linked: 'This demo is linked only to the page you are looking at. It does not send the bill to a card company or a restaurant. The slider, the number, and the sentence are all inside CodeWrangler.',
      habit: 'The tip percent is an input, not a number buried in the sentence. You can change the tip without rewriting the recipe.'
    }),
    Stage: TipStage
  },
  {
    id: 'jar',
    title: 'A coin jar',
    kicker: 'Demos',
    code: `let coins = 0

function addCoin() {
  coins = coins + 1
  return coins
}
`,
    explanation: bookPage({
      short: 'Each click adds one coin. The jar remembers the count between clicks.',
      does: 'coins is a box that survives from one click to the next. That memory, while the page is open, is called state. Close the idea and the count can start over. Emptying the jar sets it back to zero on purpose.',
      how: [
        'let coins = 0 starts the jar empty. let means the box is allowed to change later.',
        'addCoin takes the current number, adds one, stores it back, and hands the new number back.',
        'The button on this page calls that idea. The sentence above the button shows the box.',
        'Empty the jar is a second, smaller action. It does not use addCoin. It sets the box to zero directly.'
      ],
      linked: 'The count is linked to this open page, not to a bank and not to a file. Refresh the book, or empty the jar, and the memory is gone. A program that needed to remember tomorrow would write the number somewhere, such as a file or a database.',
      habit: 'The adding lives in one function. The display just shows what the function returned. The two jobs stay easy to point at.'
    }),
    Stage: JarStage
  },
  {
    id: 'chores',
    title: 'Chores still to do',
    kicker: 'Demos',
    code: `function choresLeft(chores) {
  return chores.filter((chore) => !chore.done)
}
`,
    explanation: bookPage({
      short: 'The list keeps every chore. The count at the bottom keeps only the ones that are not done.',
      does: 'filter walks a list and keeps the items that pass a test. The test here is “this chore is not done.” The ! means “not.” Checking a box changes that chore’s done fact, and the count updates.',
      how: [
        'Each chore is a small card of facts: a name, and done, which is yes or no.',
        'filter does not destroy the full list. It returns a new, shorter list. The boxes you can see are the full list.',
        'left.length is how many chores survived the filter. That is the number in “Still to do.”',
        'Checking a box flips done for that one chore and leaves the others alone.'
      ],
      linked: 'The chores are written into this demo. They are not linked to a phone reminder or a shared family list. A real list app would save them after you close the page. This one forgets when you leave.',
      habit: 'The full list and the “still to do” view are different. Keep the facts, and make the view from them, instead of deleting a chore to hide it.'
    }),
    Stage: ChoreStage
  },
  {
    id: 'light',
    title: 'A porch light',
    kicker: 'Demos',
    code: `let on = false

function flip() {
  on = !on
  return on
}
`,
    explanation: bookPage({
      short: 'The light is off until you flip it. Flip again, and it is off. The word on the lamp matches the state.',
      does: 'on is a yes-or-no box, called a Boolean. false means off. true means on. The ! flips it. One function does the whole job, and the lamp shows the result with a word, not only a color.',
      how: [
        'The page starts with false, so the first thing you see is Off.',
        'flip stores the opposite of the current value back into on, then returns it.',
        'The button calls flip. The lamp reads the same box, so the picture and the word stay together.',
        'There is no dimmer here. Two states are the whole story, which is why a Boolean fits.'
      ],
      linked: 'This light is not linked to a real porch, a smart bulb, or a power company. It is a picture on the page. A real switch would send the new on or off value to a device. The shape of the idea would be similar. The link would be new.',
      habit: 'The state is a word the interface also shows. Color helps, and the word still works if someone cannot see the color.'
    }),
    Stage: LightStage
  }
]
