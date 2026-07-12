import type { Molecule } from '@retainmol/mol-viewer/core'

type MoleculeAsyncTargetState = {
  readonly activeObjectId: string | null
  readonly objectsById: Readonly<Record<string, { readonly molecule: Molecule }>>
}

/**
 * 异步分子任务的提交目标。store 中的分子使用不可变更新，因此启动时的
 * molecule 引用就是该对象的 revision token。
 */
export type MoleculeAsyncTarget = {
  readonly objectId: string
  readonly revision: Molecule
}

export function captureActiveMoleculeTarget(
  state: MoleculeAsyncTargetState,
): MoleculeAsyncTarget | null {
  const objectId = state.activeObjectId
  if (!objectId) return null
  const object = state.objectsById[objectId]
  return object ? { objectId, revision: object.molecule } : null
}

export function isMoleculeTargetCurrent(
  state: MoleculeAsyncTargetState,
  target: MoleculeAsyncTarget,
): boolean {
  return state.objectsById[target.objectId]?.molecule === target.revision
}
