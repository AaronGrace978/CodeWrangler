import { bookPage } from '@shared/markdown'

export type Sample = {
  id: string
  language: string
  title: string
  blurb: string
  code: string
  explanation: string
}

export const samples: Sample[] = [
  {
    id: 'javascript',
    language: 'JavaScript',
    title: 'A bakery receipt',
    blurb: 'The language of most web pages.',
    code: `const muffins = 4
const price = 3.5

function bakeryTotal(count, each) {
  const treats = count * each
  const tip = treats * 0.15
  return treats + tip
}

const due = bakeryTotal(muffins, price)
console.log("Please pay $" + due.toFixed(2))
`,
    explanation: bookPage({
      short: 'Four muffins at $3.50, plus a 15% tip, comes to $16.10.',
      does: 'This page is a tiny cash register. It remembers how many muffins were sold, the price of one, and a function that can total any count at any price. Then it asks that function about these four muffins and writes the amount to pay.',
      how: [
        'muffins and price are names for two facts: 4 muffins, and $3.50 each. A name like this is called a variable, which just means a labeled box.',
        'bakeryTotal is a recipe the computer can run again. In code it is called a function. You hand it a count and a price.',
        'Inside the recipe, treats is the muffins times the price. tip is 15% of that. The recipe hands back the two amounts added together.',
        'due stores the answer for this order. console.log writes it where a programmer can see it, like a note on the counter. toFixed(2) keeps two cents digits.'
      ],
      linked: 'It is not linked to a website, a card reader, or a database. It only talks to the computer that is running it. If this page were inside a real bakery site, a button click would call bakeryTotal and show the result on the page.',
      habit: 'The price lives in one named box. If the muffin price changes, you change it once. The recipe does not hide the numbers in a place you cannot find.'
    })
  },
  {
    id: 'typescript',
    language: 'TypeScript',
    title: 'A labeled order',
    blurb: 'JavaScript with labels that catch mistakes.',
    code: `type Order = {
  item: string
  count: number
  price: number
}

function lineTotal(order: Order): number {
  return order.count * order.price
}

const muffins: Order = { item: "muffin", count: 4, price: 3.5 }
console.log(lineTotal(muffins))
`,
    explanation: bookPage({
      short: 'This is the same kind of receipt, with labels so a count cannot be swapped for a word.',
      does: 'TypeScript is JavaScript plus a set of labels. The labels are for the person writing the page and for a checker that runs before the page is used. They say what kind of thing is allowed in each box.',
      how: [
        'type Order describes a form: an item that is text, a count that is a number, and a price that is a number. Text is called a string. A number is just a number.',
        'lineTotal promises to receive a whole Order and to hand back a number. The checker complains if you pass it a name instead.',
        'muffins fills out the form. lineTotal multiplies count by price, which is 4 times 3.5, so 14.',
        'When the page actually runs, the labels are gone. What runs is ordinary JavaScript. The labels did their work earlier, while the page was being checked.'
      ],
      linked: 'It is linked to the TypeScript checker, a tool on the writer’s computer, and then to JavaScript when it runs. It is not linked to the bakery’s cash drawer unless some other page connects it.',
      habit: 'The form makes the shape of an order obvious. A reader can see the three facts an order needs without running anything.'
    })
  },
  {
    id: 'python',
    language: 'Python',
    title: 'An overdue library book',
    blurb: 'A gentle language, often a first one.',
    code: `from datetime import date

def is_overdue(due_on, today):
    return today > due_on

due = date(2026, 9, 20)
today = date(2026, 9, 30)

if is_overdue(due, today):
    print("This book is overdue. A gentle reminder is enough.")
else:
    print("This book is still on time.")
`,
    explanation: bookPage({
      short: 'The book was due on September 20, and today is September 30, so a reminder is due.',
      does: 'This page asks a yes-or-no question: is today after the due date? If yes, it prints a reminder. If no, it says the book is still on time.',
      how: [
        'from datetime import date borrows a calendar tool that comes with Python. You do not download it. datetime is the toolbox. date is the tool that means a calendar day.',
        'is_overdue is a function, a small recipe. It is overdue when today is later than due_on.',
        'due and today are two specific days. The order is year, month, day.',
        'if chooses one sentence to print. Only one of the two messages appears.'
      ],
      linked: 'It is linked to Python’s built-in calendar tools, not to a library website. A real library system would also look up the borrower’s name in a database. This page does not. It only compares two dates you can see.',
      habit: 'The reminder is a separate sentence from the date check. You can change the wording without touching the rule, and you can change the rule without rewriting the wording.'
    })
  },
  {
    id: 'html',
    language: 'HTML',
    title: 'A recipe card',
    blurb: 'The structure of a web page.',
    code: `<article class="recipe">
  <h1>Tomato soup</h1>
  <p>A small pot for a weeknight.</p>
  <ul>
    <li>4 tomatoes</li>
    <li>1 onion</li>
    <li>A pinch of salt</li>
  </ul>
</article>
`,
    explanation: bookPage({
      short: 'This is a recipe card’s skeleton: a title, one sentence, and a list.',
      does: 'HTML names the parts of a page. It does not decide the colors or the font. It says what each part is, so a browser, and a person using a screen reader, can tell a title from a list.',
      how: [
        'article is a box that holds one complete piece, here a recipe. class="recipe" is a label other pages can use to dress this box.',
        'h1 is the main title. A page usually has one.',
        'p is a paragraph, an ordinary sentence.',
        'ul is an unordered list, and each li is one item. The browser supplies the bullets.'
      ],
      linked: 'A browser is what shows it. The class recipe is a hook for CSS, the page that chooses colors and spacing. By itself, this HTML is not linked to a store or a database. It is a document.',
      habit: 'The tags say what the parts are, not how they look. A title stays a title even if someone later makes it green.'
    })
  },
  {
    id: 'css',
    language: 'CSS',
    title: 'Clothes for the card',
    blurb: 'How a page looks.',
    code: `.recipe {
  background: #f6f0e4;
  color: #241c14;
  border: 1px solid #c4a574;
  padding: 1.25rem;
  max-width: 28rem;
}

.recipe h1 {
  font-family: Georgia, serif;
  margin-top: 0;
}
`,
    explanation: bookPage({
      short: 'This dresses the recipe card in paper colors and a serif title.',
      does: 'CSS is the outfit. It finds the HTML boxes that wear the label recipe and decides their color, their border, their padding, and how wide they may grow.',
      how: [
        '.recipe means “every box with class recipe.” The dot is how CSS names a class.',
        'background is the paper color. color is the ink. The # numbers are colors written as codes.',
        'border draws a line. padding is the empty space inside the line, so the words do not touch it. max-width keeps the card from stretching across a huge screen. rem is a size tied to the reader’s text size.',
        '.recipe h1 means “a title inside that card.” It uses Georgia if the computer has it, otherwise a serif font, and it removes the extra space above the title.'
      ],
      linked: 'It is linked to HTML that uses class="recipe". If no such box exists, these rules sit quietly and change nothing. It is not linked to the words of the recipe. The words stay in the HTML.',
      habit: 'The look lives in one place. You can reprint the card in new colors without rewriting the tomatoes and the onion.'
    })
  },
  {
    id: 'sql',
    language: 'SQL',
    title: 'A question for the card catalog',
    blurb: 'The language of databases.',
    code: `SELECT title, borrower, due_on
FROM books
WHERE due_on < DATE '2026-09-30'
ORDER BY due_on;
`,
    explanation: bookPage({
      short: 'This asks a filing cabinet for overdue books, oldest due date first.',
      does: 'SQL is a question you ask a database, which is an organized cabinet of tables. This question does not change the cabinet. It only asks for rows.',
      how: [
        'SELECT names the columns you want to see: the title, the borrower, and the due date.',
        'FROM books says which table to look in. A table is a grid. Each row is one book loan.',
        'WHERE keeps only the rows whose due date is before September 30, 2026.',
        'ORDER BY sorts those rows by due date, earliest first. The semicolon ends the question.'
      ],
      linked: 'It is linked to a database that has a table named books with those columns. If the table or a column has another name, the question fails. It is not linked to the paper card in someone’s hand until a program sends this question to the database.',
      habit: 'The question says exactly which columns it needs. It does not ask for every fact in the cabinet, including ones the reader does not need.'
    })
  },
  {
    id: 'java',
    language: 'Java',
    title: 'A welcome at the door',
    blurb: 'A language used for many large, long-lived programs.',
    code: `public class Greeting {
    public static String welcome(String name) {
        if (name == null || name.isBlank()) {
            return "Welcome, neighbor.";
        }
        return "Welcome, " + name + ".";
    }
}
`,
    explanation: bookPage({
      short: 'If you give it a name, it welcomes that person. If the name is missing, it says neighbor.',
      does: 'Java likes code to live inside a class, which you can picture as a form with jobs attached. Greeting is the form. welcome is the job.',
      how: [
        'public means other parts of the program may use this. class Greeting names the form.',
        'welcome takes a String, which is text, and hands text back.',
        'null means “there is no name at all.” isBlank means the name is empty or only spaces. In either case the page uses a kind default.',
        'Otherwise it builds one sentence from the word Welcome, the name, and a period. The plus sign joins text together. It does not do arithmetic here.'
      ],
      linked: 'By itself it is not linked to a screen or a website. Some other page would call Greeting.welcome and decide where to show the sentence. It is linked to the Java language’s own text tools, which provide isBlank.',
      habit: 'The empty name is handled on purpose. A missing name should not become the sentence “Welcome, null.”'
    })
  },
  {
    id: 'csharp',
    language: 'C#',
    title: 'An average score',
    blurb: 'A close cousin of Java, common on Windows and beyond.',
    code: `var scores = new[] { 8, 9, 10 };
var total = 0;
foreach (var score in scores)
{
    total += score;
}
var average = total / (double)scores.Length;
Console.WriteLine($"The average is {average:0.0}");
`,
    explanation: bookPage({
      short: 'The scores 8, 9, and 10 average to 9.0.',
      does: 'This page adds three scores and divides by how many there are. Then it writes the average with one decimal place.',
      how: [
        'scores is a small list written in place. new[] { 8, 9, 10 } means those three numbers.',
        'foreach visits each score, one at a time. total += score means “add this score to the total.”',
        '(double) asks for decimal division. Without it, some languages would keep only whole numbers. scores.Length is how many scores there are, which is 3.',
        'Console.WriteLine writes a line. The $ before the quotes lets {average:0.0} drop the number into the sentence, with one decimal.'
      ],
      linked: 'It is linked to the console, the text window a program can write to. It is not linked to a grade book online. A real grade book would read the scores from a file or a database instead of typing them into the page.',
      habit: 'The division asks for a decimal on purpose. Averages are often not whole numbers, and the page should not throw the fraction away.'
    })
  },
  {
    id: 'go',
    language: 'Go',
    title: 'Does the plant need water?',
    blurb: 'A plain language for services that stay running.',
    code: `package main

import "fmt"

func needsWater(daysSinceRain int) bool {
    return daysSinceRain >= 3
}

func main() {
    if needsWater(4) {
        fmt.Println("Water the tomatoes.")
    }
}
`,
    explanation: bookPage({
      short: 'It has been four days since rain, and the rule is three, so the tomatoes get water.',
      does: 'This page keeps a rule in one place: water when at least three dry days have passed. main is where the program starts. It checks four days and prints a sentence if the rule says yes.',
      how: [
        'package main says this file is a program you can run, not just a box of tools for other files.',
        'import "fmt" brings in the printing tools from Go’s standard set. fmt is short for format.',
        'needsWater answers true or false. That kind of answer is called a bool, short for Boolean. >= means “greater than or equal to.”',
        'main calls the rule with 4. Four is at least three, so it prints the watering note. If you passed 1, it would print nothing.'
      ],
      linked: 'It is linked to fmt, a library that ships with Go, and to the place the program was started. It is not linked to a moisture sensor. The number 4 is written on the page.',
      habit: 'The rule is a named function. The number of dry days can change without rewriting what “needs water” means.'
    })
  },
  {
    id: 'rust',
    language: 'Rust',
    title: 'Coins in a jar',
    blurb: 'A language that is strict about sharing and mistakes.',
    code: `fn jar_total(coins: &[u32]) -> u32 {
    let mut total = 0;
    for coin in coins {
        total += coin;
    }
    total
}

fn main() {
    let coins = [25, 10, 5];
    println!("The jar holds {} cents.", jar_total(&coins));
}
`,
    explanation: bookPage({
      short: 'A quarter, a dime, and a nickel are 40 cents.',
      does: 'This page adds a list of coins. It borrows the list, reads each coin, and returns the sum. It does not spend the coins or change the list.',
      how: [
        'jar_total takes coins: &[u32]. The & means “let me look, not take ownership.” u32 means a whole number that is never negative, which suits cents.',
        'let mut total means a box that is allowed to change. mut is short for mutable. Rust makes you say so on purpose.',
        'The for loop visits each coin and adds it. The last line, total, is the value the function hands back. Rust does not need the word return here.',
        'main owns the three coins. &coins lends them to the function. println! writes the sentence. The {} is a blank that the number fills in.'
      ],
      linked: 'It is linked only to Rust’s own printing tool. The coins are written on the page. Nothing here talks to a bank.',
      habit: 'The function borrows the list instead of taking it away. The caller still has the coins afterward. That is a kindness to the next piece of code.'
    })
  },
  {
    id: 'swift',
    language: 'Swift',
    title: 'A caption on a photo',
    blurb: 'The usual language of iPhone and Mac apps.',
    code: `func caption(place: String, year: Int) -> String {
    return "\\(place), \\(year)"
}

print(caption(place: "The porch", year: 2026))
`,
    explanation: bookPage({
      short: 'It makes the caption “The porch, 2026.”',
      does: 'This page joins a place and a year into one line you could print under a photo. The function names its inputs, so the caller cannot mix up which is which as easily.',
      how: [
        'func starts a function. caption is its name. It needs a place made of text and a year made of a whole number, called Int.',
        'The arrow -> String says the function hands back text.',
        'The \\(place) form drops the value of place into the sentence. The same happens for the year. In the running language those marks are backslashes before the parentheses.',
        'print shows the caption. The call writes place: and year: so a reader can see which fact is which.'
      ],
      linked: 'print is linked to the output of a small Swift program. A photo app would instead hand this string to the screen under an image. This page does not open a camera or a photo library.',
      habit: 'The labels at the call, place: and year:, make the line readable out loud. You do not have to remember which argument comes first.'
    })
  },
  {
    id: 'kotlin',
    language: 'Kotlin',
    title: 'The warmer hour',
    blurb: 'A modern language often used for Android apps.',
    code: `fun warmer(morning: Int, afternoon: Int): Int {
    return if (afternoon > morning) afternoon else morning
}

fun main() {
    println("The warmer reading is \${warmer(62, 71)} F.")
}
`,
    explanation: bookPage({
      short: 'Between 62 and 71, the warmer reading is 71.',
      does: 'This page compares two temperatures and keeps the higher one. Then it writes that number into a sentence.',
      how: [
        'fun starts a function, the same idea as function in other languages.',
        'The if sits where a value is expected. If the afternoon is warmer, the function returns afternoon. Otherwise it returns morning. else is the “otherwise.”',
        'main is the start. warmer(62, 71) does the comparison.',
        'A dollar sign and braces drop the number into the sentence. println writes the line.'
      ],
      linked: 'It is linked to Kotlin’s printing tool. It is not linked to a thermometer. Both readings are typed on the page. An app could later pass in readings from a sensor.',
      habit: 'The choice is one expression with both paths visible. There is no missing “otherwise.”'
    })
  },
  {
    id: 'ruby',
    language: 'Ruby',
    title: 'Packages on the porch',
    blurb: 'A language written to read like sentences.',
    code: `def label(name, count)
  return "Nothing on the porch." if count <= 0
  "#{count} packages for #{name}"
end

puts label("Avery", 2)
`,
    explanation: bookPage({
      short: 'Two packages for Avery. If the count were zero, it would say the porch is clear.',
      does: 'This page builds a short label. Zero or fewer packages gets a different sentence, so the label never says “0 packages” as if that were news.',
      how: [
        'def starts the function and end finishes it. Ruby uses words as fences.',
        'The return line has a condition at the end: if count <= 0. That means “leave now with this sentence when there is nothing to deliver.”',
        'The next line is the normal label. #{count} drops the number into the text. Ruby hands back the last line without needing the word return.',
        'puts prints the label and moves to the next line. label("Avery", 2) asks for Avery’s two packages.'
      ],
      linked: 'It is linked only to the program’s own output. It does not check a shipping site. A real porch camera or carrier site would supply the count from somewhere else.',
      habit: 'The empty case is a sentence a person would say. The page does not pretend that zero packages is a normal delivery label.'
    })
  },
  {
    id: 'php',
    language: 'PHP',
    title: 'Today’s special',
    blurb: 'A language that still builds many websites.',
    code: `<?php
$special = "Tomato soup";
$price = 6;
echo "Today's special is " . $special . ". It costs $" . $price . ".";
`,
    explanation: bookPage({
      short: 'The page says today’s special is tomato soup, and it costs $6.',
      does: 'PHP often lives inside a web page. This small piece remembers the special and the price, then echoes one sentence. Echo means “write this into the page.”',
      how: [
        '<?php tells the server that the following lines are code, not words to show as-is.',
        'A dollar sign starts a variable name. $special and $price are the two facts.',
        'The dot joins pieces of text. In PHP, plus is not the joiner for words.',
        'echo sends the finished sentence onward. On a website, that usually means into the HTML the browser receives.'
      ],
      linked: 'On a real site this would be linked to a web server that runs PHP, and to the browser that displays the sentence. As written, the special and the price are on the page. They are not read from a menu database.',
      habit: 'The price is in its own box. The sentence can change wording without you hunting through the words for the number 6.'
    })
  },
  {
    id: 'c',
    language: 'C',
    title: 'Three thermometer readings',
    blurb: 'An old, small language close to the machine.',
    code: `#include <stdio.h>

int average(int a, int b, int c) {
    return (a + b + c) / 3;
}

int main(void) {
    int reading = average(68, 71, 70);
    printf("About %d degrees.\\n", reading);
    return 0;
}
`,
    explanation: bookPage({
      short: 'The readings are 68, 71, and 70. This page reports about 69 degrees, because it keeps only whole numbers.',
      does: 'C adds the three readings and divides by three using whole-number math. The true average is 69.666…. The fraction is dropped, not rounded. The page is honest about being approximate when it says “About.”',
      how: [
        '#include <stdio.h> brings in the standard tools for printing. stdio means standard input and output.',
        'average takes three ints, which are whole numbers, and returns a whole number.',
        'The parentheses add first, then divide by 3. In C, dividing two whole numbers drops the fraction.',
        'printf writes the line. %d is a blank for a whole number. \\n, written as a backslash and an n in the real page, starts a new line. return 0 in main means “finished without a problem.”'
      ],
      linked: 'It is linked to the C standard library for printing, which comes with the language. It is not linked to a weather service. The three readings are typed in main.',
      habit: 'If the fraction matters, the page should say so by using a decimal type. Here the word “About” matches what the math actually keeps.'
    })
  },
  {
    id: 'bash',
    language: 'Bash',
    title: 'A folder for notes',
    blurb: 'The language of the command line on Mac and Linux.',
    code: `#!/usr/bin/env bash
name="Sunday notes"
folder="$HOME/notes"
mkdir -p "$folder"
echo "Saved a place for $name"
`,
    explanation: bookPage({
      short: 'It makes sure a notes folder exists in your home folder, then says so.',
      does: 'Bash is what you type, or save, to give a computer a list of shell commands. This page names a folder, creates it if needed, and prints a sentence.',
      how: [
        'The first line, starting with #!, tells the computer to run this file with bash.',
        'name and folder are variables. $HOME is a variable the system already set. It is the path to your home folder.',
        'mkdir -p creates the folder. The -p means “do not complain if it is already there, and make parent folders if needed.”',
        'The quotes around "$folder" matter. They keep a space in a name from splitting one path into two commands. echo prints the sentence. $name drops the name into it.'
      ],
      linked: 'It is linked to your user account’s home folder and to the mkdir and echo commands on that computer. It does not upload the notes anywhere.',
      habit: 'The path is quoted. A folder named “Sunday notes” should stay one path, not become a surprise second command.'
    })
  },
  {
    id: 'r',
    language: 'R',
    title: 'A small set of scores',
    blurb: 'A language many people use for data and charts.',
    code: `scores <- c(8, 9, 10)
average <- mean(scores)
print(paste("Average score:", average))
`,
    explanation: bookPage({
      short: 'The average of 8, 9, and 10 is 9.',
      does: 'R is built for lists of numbers. This page puts three scores in a list, asks for their mean, and prints a sentence. Mean is another word for average.',
      how: [
        '<- stores a value under a name. You can read it as “scores gets this list.”',
        'c(8, 9, 10) combines those numbers into one list. The c stands for combine.',
        'mean(scores) is a function that already exists in R. You do not write the adding and dividing yourself.',
        'paste joins the words and the number into one line. print shows it.'
      ],
      linked: 'It is linked to R’s built-in math, which comes with the language. It is not linked to a spreadsheet until you tell R to read one. These three scores are written on the page.',
      habit: 'The average is asked for by name, mean, instead of being rewritten by hand. The usual word for the job is already in the language.'
    })
  },
  {
    id: 'lua',
    language: 'Lua',
    title: 'Tables for a supper',
    blurb: 'A small language often found inside games.',
    code: `function seats_needed(guests)
  return math.ceil(guests / 4)
end

print(seats_needed(10) .. " tables")
`,
    explanation: bookPage({
      short: 'Ten guests, four to a table, means three tables. Two tables would leave two people standing.',
      does: 'This page divides the guest count by four and rounds up. You cannot set out a fraction of a table.',
      how: [
        'function starts the recipe and end finishes it.',
        'math.ceil is “ceiling,” the next whole number up. Ten divided by four is 2.5, and the ceiling of 2.5 is 3.',
        'math is a toolbox that comes with Lua. ceil is one tool in it.',
        '.. joins the number and the word “tables” into one line. print shows that line.'
      ],
      linked: 'It is linked to Lua’s math toolbox. It is not linked to a reservation book. A game or a seating app would pass in the real guest count.',
      habit: 'Rounding up is the right kindness here. Rounding to the nearest number would sometimes leave guests without a seat.'
    })
  },
  {
    id: 'json',
    language: 'JSON',
    title: 'A recipe as data',
    blurb: 'A way to write down facts, not steps.',
    code: `{
  "title": "Tomato soup",
  "serves": 2,
  "ingredients": ["tomatoes", "onion", "salt"],
  "weeknight": true
}
`,
    explanation: bookPage({
      short: 'These are facts about a soup. They do not cook it.',
      does: 'JSON is a format for data. Programs trade it the way people trade index cards. This card has a title, a number of servings, a list of ingredients, and a yes-or-no fact: it is a weeknight dish.',
      how: [
        'The outer braces are one object, one card of named facts.',
        'Each name is in quotes. title is text, so its value is in quotes too. serves is a number, so it is not quoted.',
        'ingredients is an array, a list in square brackets. The items are text.',
        'weeknight is a Boolean, a yes or no. true means yes. JSON has no functions and no comments. It only holds facts.'
      ],
      linked: 'By itself it is linked to nothing. A JavaScript page, a Python script, or a phone app can read it. The name JSON is short for JavaScript Object Notation, but many languages speak it. Until a program opens this card, it just sits there.',
      habit: 'The facts are separated from the instructions. A shopping list and a cooking method can change on different days without being tangled together.'
    })
  },
  {
    id: 'markdown',
    language: 'Markdown',
    title: 'The first page of a project',
    blurb: 'Writing that also has a little structure.',
    code: `# Sunday soup

A short recipe for a quiet night.

## You need

- Tomatoes
- An onion
- Salt

## A note

Start the onion first.
`,
    explanation: bookPage({
      short: 'This is a readable recipe that a website can also turn into headings and a list.',
      does: 'Markdown is a plain way to write. The marks are small: a hash for a heading, a dash for a bullet. A person can read the file as it is. GitHub and many editors turn it into a formatted page.',
      how: [
        '# Sunday soup is the big title. One hash means the top heading.',
        'The blank line starts a normal paragraph.',
        '## You need is a smaller heading. Two hashes mean the next size down.',
        'Lines that start with a dash become a list. The last heading introduces one more sentence.'
      ],
      linked: 'On GitHub, a file named README.md is linked to the front page of the project. GitHub reads the Markdown and shows it as the project’s introduction. The file is also just text, so it is linked to any editor.',
      habit: 'A project’s first page should say what the thing is, in words a newcomer can read. The marks should help, not show off.'
    })
  }
]

export const starterSample = samples[0]
