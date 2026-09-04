import { cpSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const src = join(appRoot, '../../../ketcher-retainmol/packages/ketcher-react/dist')
const dest = join(appRoot, 'public/ketcher-dist')

if (!existsSync(src)) {
  console.warn('[copy-ketcher-resources] src not found:', src)
  process.exit(0)
}
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })
console.log('[copy-ketcher-resources] →', dest)
