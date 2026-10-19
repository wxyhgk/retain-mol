import { execFileSync, spawn } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const args = new Set(process.argv.slice(2))
for (const arg of args) {
  if (!['--check', '--skip-build'].includes(arg)) throw new Error(`Unknown argument: ${arg}`)
}
const checkOnly = args.has('--check')
const consumer = mkdtempSync(join(tmpdir(), 'retainmol-viewer-consumer-'))
function run(command, commandArgs, cwd = consumer) {
  execFileSync(command, commandArgs, { cwd, stdio: 'inherit' })
}

try {
  if (!args.has('--skip-build')) {
    run('npm', ['run', 'build', '--workspace', '@retainmol/core'], root)
    run('npm', ['run', 'build', '--workspace', '@retainmol/viewer'], root)
  }
  cpSync(join(root, 'examples/viewer-consumer'), consumer, {
    recursive: true,
    filter: source => !['node_modules', 'dist', 'resources.json'].includes(source.split('/').at(-1)),
  })
  const pack = name => JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', consumer], {
    cwd: join(root, 'packages', name), encoding: 'utf8',
  }))[0].filename
  const manifestPath = join(consumer, 'package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  // viewer 精确依赖同版本 core：两个 tarball 一起安装。
  for (const name of ['core', 'viewer']) manifest.dependencies[`@retainmol/${name}`] = `file:./${pack(name)}`
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'])
  run('npm', ['test'])
  run('npm', ['run', 'build'])
  console.log(`\nIndependent consumer passed (Node behavior, strict TypeScript, Vite production build).\nConsumer: ${consumer}`)
  if (checkOnly) {
    console.log('Browser/WebGL acceptance is separate; this command does not verify UI behavior.')
    rmSync(consumer, { recursive: true, force: true })
  } else {
    console.log('Preview: http://127.0.0.1:5273 — Ctrl+C to stop. Files remain available for inspection.')
    const preview = spawn('npm', ['run', 'preview'], { cwd: consumer, stdio: 'inherit' })
    process.on('SIGINT', () => preview.kill('SIGINT'))
    process.on('SIGTERM', () => preview.kill('SIGTERM'))
    preview.on('error', error => { console.error(error.message); process.exitCode = 1 })
    preview.on('exit', code => { process.exitCode = code ?? 0 })
  }
} catch (error) {
  console.error(`Consumer failed; preserved for diagnosis: ${consumer}`)
  throw error
}
