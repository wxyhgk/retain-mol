import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const requiredFiles = [
  'dist/index.html',
  'dist/server/index.js',
  'dist/openbabel-worker.js',
  'dist/openbabel/openbabel.js',
  'dist/openbabel/openbabel.wasm',
  'dist/openbabel/openbabel.data',
  'dist/ocl/resources.json',
]

async function exists(file) {
  try {
    await access(file)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

await Promise.all(requiredFiles.map(file => access(path.join(root, file))))

const indexHtml = await readFile(path.join(root, 'dist/index.html'), 'utf8')
assert.match(indexHtml, /<div id="root"><\/div>/, 'dist/index.html must contain the React root')

const hostingFile = path.join(root, '.openai/hosting.json')
if (await exists(hostingFile)) {
  const hostingJson = JSON.parse(await readFile(hostingFile, 'utf8'))
  assert.equal(
    typeof hostingJson.project_id,
    'string',
    '.openai/hosting.json must contain a Sites project_id string',
  )
  assert.ok(
    hostingJson.project_id.trim().length > 0,
    '.openai/hosting.json project_id must not be empty',
  )

  const distHostingFile = path.join(root, 'dist/.openai/hosting.json')
  const distHostingJson = JSON.parse(await readFile(distHostingFile, 'utf8'))
  assert.deepEqual(
    distHostingJson,
    hostingJson,
    'dist/.openai/hosting.json must match .openai/hosting.json',
  )
}

const workerUrl = `${pathToFileURL(path.join(root, 'dist/server/index.js')).href}?build=${Date.now()}`
const { default: worker } = await import(workerUrl)
assert.equal(typeof worker?.fetch, 'function', 'Sites worker must export a fetch handler')

const requests = []
const env = {
  ASSETS: {
    async fetch(request) {
      const pathname = new URL(request.url).pathname
      requests.push(pathname)
      if (pathname === '/index.html') {
        return new Response(indexHtml, { headers: { 'content-type': 'text/html' } })
      }
      return new Response('missing', { status: 404 })
    },
  },
}

const routeResponse = await worker.fetch(new Request('https://retainmol.test/molecules/benzene'), env)
assert.equal(routeResponse.status, 200, 'client route must fall back to index.html')
assert.deepEqual(requests, ['/molecules/benzene', '/index.html'])

requests.length = 0
const assetResponse = await worker.fetch(new Request('https://retainmol.test/openbabel/missing.wasm'), env)
assert.equal(assetResponse.status, 404, 'missing runtime asset must remain a 404')
assert.deepEqual(requests, ['/openbabel/missing.wasm'])

console.log('Sites build contract passed.')
