import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

// Resolve the consumer's own OCL resources, not the monorepo installation.
const require = createRequire(import.meta.url)
mkdirSync('public/ocl', { recursive: true })
copyFileSync(join(dirname(require.resolve('openchemlib')), 'resources.json'), 'public/ocl/resources.json')
