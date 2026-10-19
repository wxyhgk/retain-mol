import type { Atom, Molecule } from '../../../molecule'
import type { FragmentDef } from '../../fragmentLibrary'
import { isBetterPlacementScore, scoreMoleculePlacement, type PlacementScore } from '../../geometry/placementPlanner'
import { detectMergeAtoms, remapAndMergeBonds, selectHydrogensToRemove } from './ringFuseTopology'
import {
  add,
  applyMat3,
  cross,
  rotateAround,
  rotationBetweenOrthonormalBases,
  scale,
  sub,
  type Vec3,
} from '../../math'

export interface RingFusePlacementInput {
  readonly molecule: Molecule
  readonly fragment: FragmentDef
  readonly f1i: number
  readonly f2i: number
  readonly targetAtom1: Atom
  readonly targetAtom2: Atom
  readonly skip: Set<number>
  readonly isHydrogenIndex: (index: number) => boolean
  readonly fragmentMidpoint: Vec3
  readonly fragmentAxis1: Vec3
  readonly fragmentAxis2: Vec3
  readonly fragmentAxis3: Vec3
  readonly fragmentCentroid: Vec3
  readonly targetMidpoint: Vec3
  readonly targetAxis1: Vec3
  readonly preferredTargetAxis2: Vec3
  readonly orderOverride: ReadonlyMap<string, 1 | 2 | 3>
  /**
   * 凯库勒交替的备选相位（首选相位放 orderOverride）。首选相位违反键级和
   * 时（如在凯库勒单键上并苯环），备选相位顶上；全部违法则并环被拒绝。
   */
  readonly orderOverrideAlternatives?: readonly ReadonlyMap<string, 1 | 2 | 3>[]
  readonly atomById: Map<string, Atom>
}

export interface RingFusePlacementCandidate {
  readonly molecule: Molecule
  readonly mergeCount: number
  /** 合并式并环为消除超价所做的局部凯库勒翻转次数（越少越好） */
  readonly repairFlips: number
  /** 新环（目标键 + 凯库勒路径）是否保持双键交替 */
  readonly ringAlternating: boolean
  readonly score: PlacementScore
}

/** 共面四构型的最小间隙低于该值（且无合并）时，认为几何可疑，进入滚转搜索 */
const ROLL_TRIGGER_CLEARANCE = 1.0
/** 滚转采样步长（度） */
const ROLL_STEP_DEGREES = 15
/** 滚转搜索后仍达不到该间隙 → 所有构型都冲突，拒绝并环 */
const ROLL_MIN_ACCEPT_CLEARANCE = 0.6

export function planRingFusePlacement(input: RingFusePlacementInput): RingFusePlacementCandidate | null {
  const reversedInput: RingFusePlacementInput = {
    ...input,
    targetAtom1: input.targetAtom2,
    targetAtom2: input.targetAtom1,
    targetAxis1: scale(input.targetAxis1, -1),
  }
  const orientedInputs = [input, reversedInput]
  const phases: readonly ReadonlyMap<string, 1 | 2 | 3>[] = [
    input.orderOverride,
    ...(input.orderOverrideAlternatives ?? []),
  ]

  // 共面四构型（端点交换 × ±axis2）×凯库勒相位。平面芳环并环在这里就能拿到
  // 正确共面解；同一几何下相位按首选在前排序，稳定排序保证合法首选相位胜出。
  const candidates = orientedInputs
    .flatMap(orientedInput => [
      orientedInput.preferredTargetAxis2,
      scale(orientedInput.preferredTargetAxis2, -1),
    ].flatMap(axis2 => phases.map(phase => buildRingFuseCandidate(orientedInput, axis2, phase))))
    .filter((candidate): candidate is RingFusePlacementCandidate => candidate !== null)

  candidates.sort(compareRingFuseCandidates)
  const best = candidates[0] ?? null

  // 合并式并环（peri/bay）本就贴得近，间隙判据不适用；minClearance === 0 且无
  // 重叠罚分是“附近没有可比原子”（如裸键上并环）的退化情形，直接接受。
  if (best && (
    best.mergeCount > 0
    || best.score.minClearance >= ROLL_TRIGGER_CLEARANCE
    || (best.score.minClearance === 0 && best.score.overlapPenalty === 0)
  )) {
    return best
  }

  // sp3 稠合：共面镜像构型会把新环压在保留的 H 上（十氢萘 H 嵌环问题）。
  // 绕共享键（axis1）按固定步长滚转采样，把环体转进四面体空位，
  // 以“新环原子与已有原子的最小间隙最大化”评分选构型。
  let rolledBest: RingFusePlacementCandidate | null = null
  for (const orientedInput of orientedInputs) {
    for (let deg = ROLL_STEP_DEGREES; deg < 360; deg += ROLL_STEP_DEGREES) {
      if (deg % 180 === 0) continue   // 0°/180° 已由共面构型覆盖
      const axis2 = rotateAround(
        orientedInput.preferredTargetAxis2,
        orientedInput.targetAxis1,
        (deg * Math.PI) / 180,
      )
      for (const phase of phases) {
        const candidate = buildRingFuseCandidate(orientedInput, axis2, phase)
        // 滚转构型下的“原子重合”只是巧合碰撞，不做合并式并环
        if (!candidate || candidate.mergeCount > 0) continue
        if (!rolledBest || isBetterPlacementScore(candidate.score, rolledBest.score)) {
          rolledBest = candidate
        }
      }
    }
  }

  const winner = rolledBest && (!best || isBetterPlacementScore(rolledBest.score, best.score))
    ? rolledBest
    : best
  if (!winner) return null
  // 所有构型都冲突（连滚转都找不到不撞的空位）→ 干净拒绝，不产出嵌死的几何
  if (winner.score.minClearance < ROLL_MIN_ACCEPT_CLEARANCE) return null
  return winner
}

function compareRingFuseCandidates(a: RingFusePlacementCandidate, b: RingFusePlacementCandidate): number {
  if (a.mergeCount !== b.mergeCount) return a.mergeCount - b.mergeCount
  // 芳香模板并环：优先新环双键交替完好的相位（bay 拼芘只有一个相位全交替）
  if (a.ringAlternating !== b.ringAlternating) return a.ringAlternating ? -1 : 1
  // 其次优先无需凯库勒重排（或重排更少）的相位
  if (a.repairFlips !== b.repairFlips) return a.repairFlips - b.repairFlips
  if (isBetterPlacementScore(a.score, b.score)) return -1
  if (isBetterPlacementScore(b.score, a.score)) return 1
  return 0
}

function buildRingFuseCandidate(
  input: RingFusePlacementInput,
  targetAxis2: Vec3,
  orderOverride: ReadonlyMap<string, 1 | 2 | 3>,
): RingFusePlacementCandidate | null {
  const targetAxis3 = cross(input.targetAxis1, targetAxis2)
  const rotation = rotationBetweenOrthonormalBases(
    [input.fragmentAxis1, input.fragmentAxis2, input.fragmentAxis3],
    [input.targetAxis1, targetAxis2, targetAxis3],
  )
  const transform = (p: Vec3) => add(applyMat3(sub(p, input.fragmentMidpoint), rotation), input.targetMidpoint)
  const newCentroid = transform(input.fragmentCentroid)

  const merge = detectMergeAtoms(
    input.fragment,
    input.molecule,
    transform,
    input.skip,
    input.isHydrogenIndex,
    input.targetAtom1.id,
    input.targetAtom2.id,
  )
  if (merge === null) return null

  const removeIds = selectHydrogensToRemove(
    input.molecule,
    newCentroid,
    [
      input.targetAtom1.id,
      input.targetAtom2.id,
      ...merge.mergeByIndex.values(),
    ],
  )

  const result = remapAndMergeBonds(input.fragment, input.molecule, transform, {
    f1i: input.f1i,
    f2i: input.f2i,
    T1id: input.targetAtom1.id,
    T2id: input.targetAtom2.id,
    skip: input.skip,
    isH: input.isHydrogenIndex,
    merge,
    removeIds,
    orderOverride,
  })
  if (!result) return null

  const existingIds = new Set(input.molecule.atoms.map(atom => atom.id))
  const placementAtoms = result.molecule.atoms.filter(atom => !existingIds.has(atom.id))
  const score = scoreMoleculePlacement(
    input.molecule.atoms,
    { atoms: placementAtoms, bonds: [] },
    {
      excludeAtomIds: new Set([
        input.targetAtom1.id,
        input.targetAtom2.id,
        ...removeIds,
        ...merge.mergeByIndex.values(),
      ]),
    },
  )

  return { ...result, score }
}
