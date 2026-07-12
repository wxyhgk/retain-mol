import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const packageDir = resolve(import.meta.dirname, '..')
const distDir = join(packageDir, 'dist')
const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) files.push(...walk(path))
    else files.push(path)
  }
  return files
}

const errors = []
for (const [subpath, entry] of Object.entries(pkg.exports)) {
  for (const field of ['types', 'import']) {
    if (!existsSync(resolve(packageDir, entry[field]))) {
      errors.push(`${subpath} ${field} target is missing: ${entry[field]}`)
    }
  }
}

const files = walk(distDir)
if (files.some(file => file.endsWith('.d.ts.map'))) {
  errors.push('declaration maps must not be published')
}
const js = files.filter(file => file.endsWith('.js')).map(file => readFileSync(file, 'utf8')).join('\n')
if (js.includes('ZodEncodeError') || js.includes('node_modules/zod/')) {
  errors.push('zod implementation was bundled instead of externalized')
}
if (!/from\s+["']zod["']/.test(js)) {
  errors.push('style runtime no longer references the external zod dependency')
}

if (errors.length > 0) {
  console.error('Package dist contract failed:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Package dist contract passed.')
