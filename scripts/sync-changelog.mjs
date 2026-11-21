import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const tempRoot = realpathSync(tmpdir())
const checkout = mkdtempSync(join(tempRoot, 'rove-commits-'))
const output = new URL('../src/data/rove-commits.json', import.meta.url)

try {
  execFileSync('git', [
    'clone', '--filter=blob:none', '--no-checkout', '--no-tags', '--single-branch', '--branch', 'main',
    'https://github.com/haitang000/RoveBrowser.git', checkout,
  ], { stdio: 'inherit' })

  const log = execFileSync('git', ['-C', checkout, 'log', '-z', '--format=%H%x00%cI%x00%an%x00%B'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  const fields = log.split('\0')
  if (fields.pop() !== '' || !fields.length || fields.length % 4 !== 0) {
    throw new Error('Could not read the RoveBrowser commit history.')
  }

  const rows = []
  for (let index = 0; index < fields.length; index += 4) {
    const [sha, timestamp, author, message] = fields.slice(index, index + 4)
    const lines = message.trim().split(/\r?\n/)
    const cleanMessage = lines.filter(line => !/^(?:Co-authored-by|Signed-off-by):/i.test(line)).join('\n').trim()
    rows.push(JSON.stringify({ sha, date: new Date(timestamp).toISOString(), author, message: cleanMessage }))
  }

  mkdirSync(new URL('./', output), { recursive: true })
  writeFileSync(output, `[\n  ${rows.join(',\n  ')}\n]\n`)
  console.log(`Saved ${rows.length} commits from RoveBrowser/main.`)
} finally {
  if (dirname(realpathSync(checkout)) === tempRoot) rmSync(checkout, { recursive: true, maxRetries: 3 })
}
