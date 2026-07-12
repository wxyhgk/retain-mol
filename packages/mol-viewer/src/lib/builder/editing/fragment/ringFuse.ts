import type { Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import type { AttachResult } from './types'
import { planRingFusePlacement } from './ringFusePlacement'
import { buildRingFuseFragmentFrame, buildRingFuseTargetFrame } from './ringFuseGeometry'
import { buildRingFuseOrderOverride } from './ringFuseKekule'
import { buildRingFuseSkipSet, resolveRingFuseTarget, validateRingFuseSharedValence } from './ringFuseRules'

/**
 * Ketcher 式并环：点击已有的键，把模板环的 attachBond 边融合上去
 * （苯环模板点 C-C 键 → 萘式稠环）。
 *
 * 几何：模板边中点/方向/环体朝向 三轴对齐到目标键。方向自动探索：
 * 先放在远离已有取代基的一侧，撞到已有原子则自动翻到另一侧再试。
 * 新环原子落在已有同元素原子上（凹区并环，如菲 bay 区拼芘）→ 自动
 * 合并共用该原子（Ketcher 行为），并删掉它多余的 H。
 * 共享边的两个原子各删一个 H（取离新环最近的）。
 * 键级：含双键的模板沿环路径重排凯库勒交替，使其与目标键键级衔接。
 */
export function fuseFragmentOnBond(
  mol: Molecule,
  frag: FragmentDef,
  bondId: string,
): AttachResult {
  if (!frag.attachBond) return { ok: false, reason: `${frag.name} 是基团，请点击原子连接` }
  const target = resolveRingFuseTarget(mol, bondId)
  if (target.ok === false) return { ok: false, reason: target.reason }

  const [f1i, f2i] = frag.attachBond
  const isH = (i: number) => frag.atoms[i].symbol === 'H'
  const skip = buildRingFuseSkipSet(frag, f1i, f2i, isH)

  const atomById = new Map(mol.atoms.map(a => [a.id, a]))
  const fragmentFrame = buildRingFuseFragmentFrame(frag, f1i, f2i)
  if (!fragmentFrame) return { ok: false, reason: '模板几何异常' }
  const targetFrame = buildRingFuseTargetFrame(mol, target.targetAtom1, target.targetAtom2)

  const orderOverride = buildRingFuseOrderOverride(frag, f1i, f2i, target.bond.order, isH)

  // 方向自动探索：交换共享边端点并尝试两侧，共四种构型。优先零合并的
  // 干净并环（外侧），其次才是合并式并环（凹区拼稠环，如菲 bay → 芘）。
  const candidate = planRingFusePlacement({
    molecule: mol,
    fragment: frag,
    f1i,
    f2i,
    targetAtom1: target.targetAtom1,
    targetAtom2: target.targetAtom2,
    skip,
    isHydrogenIndex: isH,
    fragmentMidpoint: fragmentFrame.midpoint,
    fragmentAxis1: fragmentFrame.axis1,
    fragmentAxis2: fragmentFrame.axis2,
    fragmentAxis3: fragmentFrame.axis3,
    fragmentCentroid: fragmentFrame.centroid,
    targetMidpoint: targetFrame.midpoint,
    targetAxis1: targetFrame.axis1,
    preferredTargetAxis2: targetFrame.preferredAxis2,
    orderOverride,
    atomById,
  })
  if (!candidate) return { ok: false, reason: '该键两侧空间都放不下新环' }
  // 没有几何合并时，共享端点必然各新增一条连接，可做严格键价检查。
  // peri 路径会把模板原子合并到现有原子，必须由最终拓扑检查决定。
  if (candidate.mergeCount === 0) {
    const valenceError = validateRingFuseSharedValence(
      mol,
      [target.targetAtom1, target.targetAtom2],
    )
    if (valenceError) return { ok: false, reason: valenceError }
  }
  return { ok: true, molecule: candidate.molecule }
}
