import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const candidateFiles = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean)

const rules = [
  { name: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { name: 'OpenAI-style key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'committed sudo credential', pattern: /系统的\s*sudo\s*密码/i },
]

const findings = []
for (const file of candidateFiles) {
  let content
  try {
    content = readFileSync(file)
  } catch {
    continue
  }
  if (content.includes(0)) continue
  const text = content.toString('utf8')
  for (const rule of rules) {
    if (rule.pattern.test(text)) findings.push(`${file}: ${rule.name}`)
  }
}

if (findings.length) {
  console.error('Secret check failed:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log(`Secret check passed (${candidateFiles.length} tracked and untracked files scanned).`)
