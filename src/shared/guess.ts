const RULES: Array<[string, (code: string) => boolean]> = [
  ['PHP', (code) => /<\?php/i.test(code)],
  ['JSON', (code) => isJsonDocument(code)],
  ['SQL', (code) => /\bselect\b/i.test(code) && /\bfrom\b/i.test(code)],
  ['HTML', (code) => /<\s*(html|article|div|p|h1|ul|body|section)\b/i.test(code)],
  ['CSS', (code) => /\{[^}]*:\s*[^};]+;/.test(code) && !/\b(function|def|func|class)\b/.test(code)],
  ['Markdown', (code) => /^#{1,3}\s+\S/m.test(code) && !/\b(function|const|def|select)\b/.test(code)],
  ['Bash', (code) => /^#!/.test(code) || /\bmkdir\s+-p\b/.test(code)],
  ['Go', (code) => /\bpackage\s+main\b/.test(code) || /\bfmt\./.test(code)],
  ['Rust', (code) => /\bfn\s+\w+/.test(code) && (/\blet\s+mut\b/.test(code) || /\bfn\s+main\b/.test(code))],
  ['C', (code) => /#include\s*</.test(code)],
  ['Java', (code) => /\bpublic\s+class\b/.test(code)],
  ['C#', (code) => /\bConsole\.(Write|WriteLine)\b/.test(code)],
  ['Kotlin', (code) => /\bfun\s+\w+/.test(code)],
  ['Swift', (code) => /\bfunc\s+\w+/.test(code)],
  ['Python', (code) => /\bdef\s+\w+\s*\([^)]*\)\s*:/.test(code)],
  ['Ruby', (code) => (/\bdef\s+\w+/.test(code) && /\bend\b/.test(code)) || /\bputs\b/.test(code)],
  ['R', (code) => /<-\s*/.test(code) && /\b(mean|c)\s*\(/.test(code)],
  ['Lua', (code) => /\bfunction\b/.test(code) && /\bend\b/.test(code)],
  ['TypeScript', (code) => /\b(type|interface)\s+[A-Za-z]/.test(code) || /:\s*(string|number|boolean)\b/.test(code)],
  ['JavaScript', (code) => /\b(function|const|let|console)\b/.test(code)]
]

function isJsonDocument(code: string): boolean {
  const trimmed = code.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false
  try {
    const value = JSON.parse(trimmed) as unknown
    return value !== null && typeof value === 'object'
  } catch {
    return false
  }
}

export function guessLanguage(code: string): string {
  const sample = code.trim()
  if (!sample) return 'Plain text'
  for (const [language, test] of RULES) {
    if (test(sample)) return language
  }
  return 'Plain text'
}
