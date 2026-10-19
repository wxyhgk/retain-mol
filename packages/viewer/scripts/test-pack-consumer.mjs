import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const packageDir = resolve(import.meta.dirname, '..')
const workspaceDir = resolve(packageDir, '../..')
const consumerDir = mkdtempSync(join(tmpdir(), 'retainmol-viewer-pack-consumer-'))

function run(command, args, cwd = consumerDir) {
  execFileSync(command, args, { cwd, stdio: 'inherit' })
}

try {
  // viewer 依赖尚未发布的 @retainmol/core：两个 tarball 一起安装，模拟真实发布后的依赖解析。
  const pack = dir => {
    const [{ filename }] = JSON.parse(execFileSync(
      'npm',
      ['pack', '--json', '--pack-destination', consumerDir],
      { cwd: dir, encoding: 'utf8' },
    ))
    return join(consumerDir, filename)
  }
  const coreTarball = pack(resolve(packageDir, '../core'))
  const tarball = pack(packageDir)

  writeFileSync(join(consumerDir, 'package.json'), JSON.stringify({
    name: 'retainmol-viewer-pack-consumer',
    private: true,
    type: 'module',
    dependencies: {
      '@retainmol/core': `file:${coreTarball}`,
      '@retainmol/viewer': `file:${tarball}`,
      react: '^19.2.5',
      'react-dom': '^19.2.5',
      three: '^0.184.0'
    },
    devDependencies: {
      '@types/react': '^19.2.14',
      '@types/react-dom': '^19.2.3',
      '@types/three': '^0.184.0'
    }
  }, null, 2))
  run('npm', ['install', '--ignore-scripts', '--no-package-lock', '--no-audit', '--no-fund'])

  writeFileSync(join(consumerDir, 'consumer.mjs'), `
import { newAtom } from '@retainmol/core'
import { listFragments } from '@retainmol/core/fragments'
import { listThemes } from '@retainmol/viewer/styles'
import { listMaterialFactories } from '@retainmol/viewer/three'
import { listMoleculeTemplates } from '@retainmol/core/templates'
import { calcDistance } from '@retainmol/core/geometry'
import { splitConnectedComponents } from '@retainmol/core/graph'
import { createViewerRuntime } from '@retainmol/viewer/runtime'
import { createObjectPositionWriteEditSession } from '@retainmol/viewer/editing'
import { createHeadlessModelingContext, parseEditPlan, replayEditPlan } from '@retainmol/viewer/modeling'
import { useMoleculeStore } from '@retainmol/viewer/state'

if (newAtom('C', 0, 0, 0).symbol !== 'C') throw new Error('core runtime import failed')
if (listFragments().length === 0) throw new Error('fragment runtime import failed')
if (listThemes().length === 0) throw new Error('style runtime import failed')
if (listMaterialFactories().length === 0) throw new Error('three extension runtime import failed')
if (listMoleculeTemplates().length === 0) throw new Error('template runtime import failed')
if (calcDistance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 }) !== 5) throw new Error('geometry runtime import failed')
const disconnected = { atoms: [newAtom('C', 0, 0, 0), newAtom('H', 10, 0, 0)], bonds: [] }
if (splitConnectedComponents(disconnected).length !== 2) throw new Error('graph runtime import failed')
if (!createViewerRuntime()) throw new Error('runtime entry import failed')
// viewer 与宿主必须共享同一份 core（片段库等注册表是模块级单例）。
const { existsSync } = await import('node:fs')
if (existsSync('node_modules/@retainmol/viewer/node_modules/@retainmol/core')) throw new Error('viewer installed a second @retainmol/core copy')
if (typeof createObjectPositionWriteEditSession !== 'function') throw new Error('editing entry import failed')
if (typeof parseEditPlan !== 'function') throw new Error('modeling entry import failed')
const headlessMolecule = { atoms: [newAtom('C', 0, 0, 0)], bonds: [] }
if (createHeadlessModelingContext(headlessMolecule).objects.length !== 1) throw new Error('headless modeling context failed')
if (typeof replayEditPlan !== 'function') throw new Error('headless modeling replay failed')
if (typeof useMoleculeStore !== 'function') throw new Error('state entry import failed')
`)

  writeFileSync(join(consumerDir, 'consumer.ts'), `
import type { Molecule } from '@retainmol/core'
import type { PublicFragmentDef } from '@retainmol/core/fragments'
import type { StylePresetMetadata } from '@retainmol/viewer/styles'
import type { MoleculeTemplateDef } from '@retainmol/core/templates'
import type { ViewerRuntime } from '@retainmol/viewer/runtime'
import type { RendererPort } from '@retainmol/viewer/viewer'
import type { ObjectPositionWriteEditSession } from '@retainmol/viewer/editing'
import type { EditPlan, HeadlessModelingOptions, ModelingConstraints } from '@retainmol/viewer/modeling'
import { replayEditPlan as replayHeadless } from '@retainmol/core/headless'
import type { EditPlan as HeadlessPlan, Molecule as HeadlessMolecule } from '@retainmol/core/headless'

declare const molecule: Molecule
declare const fragment: PublicFragmentDef
declare const style: StylePresetMetadata
declare const template: MoleculeTemplateDef
declare const runtime: ViewerRuntime
declare const renderer: RendererPort
declare const editSession: ObjectPositionWriteEditSession
declare const editPlan: EditPlan
declare const modelingConstraints: ModelingConstraints
declare const headlessOptions: HeadlessModelingOptions
void [molecule, fragment, style, template, runtime, renderer, editSession, editPlan, modelingConstraints, headlessOptions]
const compatiblePlan: HeadlessPlan = editPlan
const compatibleMolecule: HeadlessMolecule = molecule
void replayHeadless(compatibleMolecule, compatiblePlan, headlessOptions)
`)

  run('node', ['consumer.mjs'])
  run(resolve(workspaceDir, 'node_modules/.bin/tsc'), [
    '--noEmit',
    '--strict',
    '--target', 'ES2023',
    '--module', 'NodeNext',
    '--moduleResolution', 'NodeNext',
    'consumer.ts',
  ])

  const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
  console.log(`Packed consumer passed for ${manifest.name}@${manifest.version}.`)
} finally {
  rmSync(consumerDir, { recursive: true, force: true })
}
