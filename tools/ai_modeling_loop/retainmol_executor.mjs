#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { exportSdf } from '@retainmol/mol-viewer/io'
import {
  MODELING_COMMAND_KINDS,
  createHeadlessModelingContext,
  replayEditPlan,
} from '@retainmol/mol-viewer/modeling'

const EXECUTOR_ID = '@retainmol/mol-viewer/modeling'
const EXECUTOR_SCHEMA_VERSION = 1

function parseArgs(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index]
    if (!name?.startsWith('--')) throw new Error(`未知参数：${name}`)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`参数缺少值：${name}`)
    values.set(name.slice(2), value)
    index += 1
  }
  for (const required of ['initial', 'plan', 'output', 'receipt', 'metadata']) {
    if (!values.has(required)) throw new Error(`缺少参数：--${required}`)
  }
  return Object.fromEntries(values)
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function isMolecule(value) {
  return value && typeof value === 'object' && Array.isArray(value.atoms) && Array.isArray(value.bonds)
}

function unique(values) {
  return [...new Set(values)]
}

function withEnforcedConstraints(plan, fixedAtomIds) {
  const constraints = plan.constraints ?? {}
  return {
    ...plan,
    constraints: {
      ...constraints,
      fixedAtomPositions: unique([
        ...(constraints.fixedAtomPositions ?? []),
        ...fixedAtomIds,
      ]),
      protectedAtomIds: unique([
        ...(constraints.protectedAtomIds ?? []),
        ...fixedAtomIds,
      ]),
    },
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const initialText = await readFile(args.initial, 'utf8')
  const planText = await readFile(args.plan, 'utf8')
  const initial = JSON.parse(initialText)
  const submittedPlan = JSON.parse(planText)
  if (initial.schemaVersion !== 1 || !isMolecule(initial.molecule)) {
    throw new Error('initial-molecule.json 格式无效')
  }
  if (typeof initial.objectId !== 'string' || initial.objectId.length === 0) {
    throw new Error('initial-molecule.json 缺少 objectId')
  }
  if (submittedPlan.targetObjectId !== initial.objectId) {
    throw new Error(`EditPlan targetObjectId 必须为 ${initial.objectId}`)
  }

  const fixedAtomIds = unique(initial.fixedAtomIds ?? [])
  const initialAtomIds = new Set(initial.molecule.atoms.map(atom => atom.id))
  const missingFixedAtom = fixedAtomIds.find(atomId => !initialAtomIds.has(atomId))
  if (missingFixedAtom) throw new Error(`固定原子不存在：${missingFixedAtom}`)

  const context = createHeadlessModelingContext(initial.molecule, {
    objectId: initial.objectId,
    name: initial.molecule.name,
  })
  const plan = withEnforcedConstraints(submittedPlan, fixedAtomIds)
  const result = replayEditPlan(initial.molecule, plan, { objectId: initial.objectId })
  const receipt = {
    schemaVersion: EXECUTOR_SCHEMA_VERSION,
    executor: EXECUTOR_ID,
    status: result.ok ? 'completed' : 'rejected',
    inputSha256: sha256(initialText),
    submittedPlanSha256: sha256(planText),
    enforcedPlanSha256: sha256(JSON.stringify(plan)),
    targetObjectId: result.targetObjectId,
    baseRevision: result.baseRevision,
    commandCount: Array.isArray(plan.commands) ? plan.commands.length : 0,
    capabilities: MODELING_COMMAND_KINDS,
    issues: result.issues,
    ...(result.ok
      ? {
          changed: result.changed,
          nextRevision: result.nextRevision,
          changes: result.changes,
        }
      : {}),
  }

  await mkdir(path.dirname(args.receipt), { recursive: true })
  await writeFile(args.receipt, `${JSON.stringify(receipt, null, 2)}\n`)
  if (!result.ok) {
    process.stderr.write(`${JSON.stringify(receipt, null, 2)}\n`)
    process.exitCode = 2
    return
  }

  const sdf = exportSdf(result.molecule)
  const anchorAtomIndices = Object.fromEntries(
    fixedAtomIds.map(atomId => {
      const index = result.molecule.atoms.findIndex(atom => atom.id === atomId)
      if (index < 0) throw new Error(`执行后固定原子丢失：${atomId}`)
      return [atomId, index + 1]
    }),
  )
  const metadata = {
    schemaVersion: 1,
    builder: 'retainmol-edit-plan',
    planId: plan.planId,
    targetObjectId: plan.targetObjectId,
    anchorAtomIndices,
    commandCount: plan.commands.length,
    executorReceipt: path.basename(args.receipt),
  }

  await mkdir(path.dirname(args.output), { recursive: true })
  await writeFile(args.output, sdf)
  await writeFile(args.metadata, `${JSON.stringify(metadata, null, 2)}\n`)
  await writeFile(args.receipt, `${JSON.stringify({
    ...receipt,
    outputSha256: sha256(sdf),
    atomCount: result.molecule.atoms.length,
    bondCount: result.molecule.bonds.length,
  }, null, 2)}\n`)
}

main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`)
  process.exitCode = 1
})
