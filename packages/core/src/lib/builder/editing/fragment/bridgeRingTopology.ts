import type { Atom, Bond, Molecule } from '../../../molecule'
import { GraphIndex } from '../../kernel/GraphIndex'
import type { FragmentBond, FragmentDef } from '../../fragment/model'
import { maxValence } from '../../valence'
import { findFragmentBond } from './fragmentGuards'
import { removeHydrogensUntilValenceFits } from './valenceFit'
import type {
  BridgeRingAtomRef,
  BridgeRingBetweenBondsInput,
  BridgeRingBondSpec,
  BridgeRingFailureCode,
  BridgeRingMappingDiagnostic,
  BridgeRingTopologyCandidate,
  PlanBridgeRingResult,
} from './bridgeRingTypes'

interface ValidatedTemplate {
  readonly heavyAtomIndices: readonly number[]
  readonly heavyBonds: readonly FragmentBond[]
}

type TemplateValidationResult =
  | { readonly ok: true; readonly value: ValidatedTemplate }
  | { readonly ok: false; readonly code: BridgeRingFailureCode; readonly reason: string }

const flips = [false, true] as const

type FailedResult<T> = Extract<T, { readonly ok: false }>

function isFailure<T extends { readonly ok: boolean }>(result: T): result is FailedResult<T> {
  return result.ok === false
}

export function planBridgeRingBetweenBonds(
  molecule: Molecule,
  input: BridgeRingBetweenBondsInput,
): PlanBridgeRingResult {
  const graph = new GraphIndex(molecule)
  const [firstBondId, secondBondId] = input.targetBondIds
  if (firstBondId === secondBondId) {
    return failure('same-target-bond', '必须选择两条不同的目标键')
  }

  const firstBond = graph.bond(firstBondId)
  const secondBond = graph.bond(secondBondId)
  if (!firstBond || !secondBond) {
    return failure('target-bond-not-found', '目标键不存在')
  }

  const targetAtoms = resolveTargetAtoms(graph, firstBond, secondBond)
  if (isFailure(targetAtoms)) return targetAtoms.result

  const uniqueTargetAtomIds = new Set(targetAtoms.value.flat().map(atom => atom.id))
  if (uniqueTargetAtomIds.size !== 4) {
    return failure('target-bonds-share-atom', '两条目标键必须具有四个不同的端点')
  }

  const template = validateSevenCycleTemplate(input.fragment, input.templateBondPairs)
  if (isFailure(template)) return failure(template.code, template.reason)

  const candidatesByKey = new Map<string, BridgeRingTopologyCandidate>()
  const rejectedMappings: BridgeRingMappingDiagnostic[] = []

  for (const reverseFirst of flips) {
    for (const reverseSecond of flips) {
      const planned = planMapping({
        molecule,
        graph,
        fragment: input.fragment,
        template: template.value,
        templateBondPairs: input.templateBondPairs,
        targetAtoms: targetAtoms.value,
        reverseFirst,
        reverseSecond,
      })
      if (isFailure(planned)) {
        rejectedMappings.push({ reverseFirst, reverseSecond, ...planned.diagnostic })
        continue
      }
      if (!candidatesByKey.has(planned.candidate.key)) {
        candidatesByKey.set(planned.candidate.key, planned.candidate)
      }
    }
  }

  const candidates = [...candidatesByKey.values()].sort((left, right) => left.key.localeCompare(right.key))
  if (candidates.length === 0) {
    return {
      ok: false,
      code: 'no-valid-mapping',
      reason: '没有满足元素、键和价态约束的七元环映射',
      rejectedMappings,
    }
  }
  return { ok: true, candidates, rejectedMappings }
}

function planMapping(input: {
  readonly molecule: Molecule
  readonly graph: GraphIndex
  readonly fragment: FragmentDef
  readonly template: ValidatedTemplate
  readonly templateBondPairs: BridgeRingBetweenBondsInput['templateBondPairs']
  readonly targetAtoms: readonly [readonly [Atom, Atom], readonly [Atom, Atom]]
  readonly reverseFirst: boolean
  readonly reverseSecond: boolean
}):
  | { readonly ok: true; readonly candidate: BridgeRingTopologyCandidate }
  | { readonly ok: false; readonly diagnostic: Omit<BridgeRingMappingDiagnostic, 'reverseFirst' | 'reverseSecond'> } {
  const templateAtomToExistingAtomId = new Map<number, string>()
  const reversals = [input.reverseFirst, input.reverseSecond] as const

  for (let pairIndex = 0; pairIndex < 2; pairIndex += 1) {
    const templatePair = input.templateBondPairs[pairIndex]!
    const targetPair = input.targetAtoms[pairIndex]!
    const mappedTargets = reversals[pairIndex]
      ? [targetPair[1], targetPair[0]] as const
      : targetPair
    for (let endpoint = 0; endpoint < 2; endpoint += 1) {
      const templateIndex = templatePair[endpoint]!
      const templateAtom = input.fragment.atoms[templateIndex]!
      const targetAtom = mappedTargets[endpoint]!
      if (templateAtom.symbol !== targetAtom.symbol) {
        return rejected(
          'element-mismatch',
          `模板 ${templateAtom.symbol} 不能复用目标 ${targetAtom.symbol}`,
        )
      }
      templateAtomToExistingAtomId.set(templateIndex, targetAtom.id)
    }
  }

  const sharedTemplateEdges = new Set(input.templateBondPairs.map(pair => templatePairKey(pair[0], pair[1])))
  const bondSpecs: BridgeRingBondSpec[] = []
  for (const bond of input.template.heavyBonds) {
    if (sharedTemplateEdges.has(templatePairKey(bond.a, bond.b))) continue
    const atom1 = atomRef(bond.a, templateAtomToExistingAtomId)
    const atom2 = atomRef(bond.b, templateAtomToExistingAtomId)
    if (atom1.kind === 'existing' && atom2.kind === 'existing' && input.graph.findBond(atom1.atomId, atom2.atomId)) {
      return rejected('duplicate-existing-bond', '候选会额外复用或重复创建宿主键')
    }
    bondSpecs.push({ atom1, atom2, order: bond.order })
  }

  const removeAtomIds = new Set<string>()
  const addedOrderByHost = new Map<string, number>()
  for (const bond of bondSpecs) {
    addExistingEndpointOrder(addedOrderByHost, bond.atom1, bond.order)
    addExistingEndpointOrder(addedOrderByHost, bond.atom2, bond.order)
  }
  for (const hostId of [...addedOrderByHost.keys()].sort()) {
    const host = input.graph.atom(hostId)!
    if (!removeHydrogensUntilValenceFits(
      input.molecule,
      host,
      removeAtomIds,
      addedOrderByHost.get(hostId)!,
    )) {
      return rejected('over-valence', `${host.symbol} 已饱和，无法桥连七元环`)
    }
  }

  const newHeavyAtomTemplateIndices = input.template.heavyAtomIndices
    .filter(index => !templateAtomToExistingAtomId.has(index))
    .sort((left, right) => left - right)
  const atomSpecs = newHeavyAtomTemplateIndices.map(templateIndex => ({
    templateIndex,
    symbol: input.fragment.atoms[templateIndex]!.symbol,
  }))
  const key = canonicalCandidateKey(
    atomSpecs,
    bondSpecs,
    [...removeAtomIds].sort(),
    newHeavyAtomTemplateIndices,
  )

  return {
    ok: true,
    candidate: {
      key,
      reverseFirst: input.reverseFirst,
      reverseSecond: input.reverseSecond,
      templateAtomToExistingAtomId,
      newHeavyAtomTemplateIndices,
      removeAtomIds: [...removeAtomIds].sort(),
      atomSpecs,
      bondSpecs,
    },
  }
}

function validateSevenCycleTemplate(
  fragment: FragmentDef,
  templateBondPairs: BridgeRingBetweenBondsInput['templateBondPairs'],
): TemplateValidationResult {
  const heavyAtomIndices = fragment.atoms
    .map((atom, index) => atom.symbol === 'H' ? null : index)
    .filter((index): index is number => index !== null)
  if (heavyAtomIndices.length !== 7) {
    return { ok: false, code: 'template-not-seven-cycle', reason: '模板必须恰好包含七个重原子' }
  }

  const heavySet = new Set(heavyAtomIndices)
  const heavyBonds: FragmentBond[] = []
  const seenEdges = new Set<string>()
  const degree = new Map(heavyAtomIndices.map(index => [index, 0]))
  for (const bond of fragment.bonds) {
    if (!fragment.atoms[bond.a] || !fragment.atoms[bond.b] || bond.a === bond.b) {
      return { ok: false, code: 'template-invalid', reason: '模板键引用无效或包含自环' }
    }
    if (!heavySet.has(bond.a) || !heavySet.has(bond.b)) continue
    const key = templatePairKey(bond.a, bond.b)
    if (seenEdges.has(key)) {
      return { ok: false, code: 'template-invalid', reason: '模板包含重复重原子键' }
    }
    seenEdges.add(key)
    heavyBonds.push(bond)
    degree.set(bond.a, degree.get(bond.a)! + 1)
    degree.set(bond.b, degree.get(bond.b)! + 1)
  }
  if (heavyBonds.length !== 7 || [...degree.values()].some(value => value !== 2)) {
    return { ok: false, code: 'template-not-seven-cycle', reason: '模板重原子图必须是简单七元环' }
  }
  if (!isConnectedCycle(heavyAtomIndices, heavyBonds)) {
    return { ok: false, code: 'template-not-seven-cycle', reason: '模板七元环不连通' }
  }

  const [firstPair, secondPair] = templateBondPairs
  if (new Set([...firstPair, ...secondPair]).size !== 4) {
    return { ok: false, code: 'template-bonds-share-atom', reason: '两条模板融合边必须具有四个不同端点' }
  }
  for (const pair of templateBondPairs) {
    const [first, second] = pair
    if (!heavySet.has(first) || !heavySet.has(second) || !findFragmentBond(fragment, first, second)) {
      return { ok: false, code: 'template-bond-invalid', reason: '模板融合边必须是七元环上的重原子键' }
    }
  }

  for (const index of heavyAtomIndices) {
    const atom = fragment.atoms[index]!
    const used = heavyBonds
      .filter(bond => bond.a === index || bond.b === index)
      .reduce((sum, bond) => sum + bond.order, 0)
    const templateAtom: Atom = { id: '', symbol: atom.symbol, x: 0, y: 0, z: 0 }
    if (used > maxValence(templateAtom) + 1e-8) {
      return { ok: false, code: 'template-invalid', reason: `${atom.symbol} 的模板键价超过允许上限` }
    }
  }

  return { ok: true, value: { heavyAtomIndices, heavyBonds } }
}

function resolveTargetAtoms(
  graph: GraphIndex,
  firstBond: Bond,
  secondBond: Bond,
):
  | { readonly ok: true; readonly value: readonly [readonly [Atom, Atom], readonly [Atom, Atom]] }
  | { readonly ok: false; readonly result: PlanBridgeRingResult } {
  const firstAtoms = [graph.atom(firstBond.atomId1), graph.atom(firstBond.atomId2)] as const
  const secondAtoms = [graph.atom(secondBond.atomId1), graph.atom(secondBond.atomId2)] as const
  const [firstAtom1, firstAtom2, secondAtom1, secondAtom2] = [...firstAtoms, ...secondAtoms]
  if (!firstAtom1 || !firstAtom2 || !secondAtom1 || !secondAtom2) {
    return { ok: false, result: failure('target-bond-invalid', '目标键引用了不存在的原子') }
  }
  if ([firstAtom1, firstAtom2, secondAtom1, secondAtom2].some(atom => atom.symbol === 'H')) {
    return { ok: false, result: failure('target-bond-invalid', '不能使用 X-H 键桥连七元环') }
  }
  return {
    ok: true,
    value: [
      [firstAtom1, firstAtom2],
      [secondAtom1, secondAtom2],
    ],
  }
}

function isConnectedCycle(indices: readonly number[], bonds: readonly FragmentBond[]): boolean {
  const neighbors = new Map(indices.map(index => [index, [] as number[]]))
  for (const bond of bonds) {
    neighbors.get(bond.a)!.push(bond.b)
    neighbors.get(bond.b)!.push(bond.a)
  }
  const visited = new Set<number>()
  const stack = [indices[0]!]
  while (stack.length > 0) {
    const current = stack.pop()!
    if (visited.has(current)) continue
    visited.add(current)
    stack.push(...neighbors.get(current)!)
  }
  return visited.size === indices.length
}

function atomRef(index: number, mapping: ReadonlyMap<number, string>): BridgeRingAtomRef {
  const atomId = mapping.get(index)
  return atomId === undefined
    ? { kind: 'template', templateIndex: index }
    : { kind: 'existing', atomId }
}

function addExistingEndpointOrder(
  orders: Map<string, number>,
  atom: BridgeRingAtomRef,
  order: number,
): void {
  if (atom.kind !== 'existing') return
  orders.set(atom.atomId, (orders.get(atom.atomId) ?? 0) + order)
}

function canonicalCandidateKey(
  atomSpecs: readonly { readonly templateIndex: number; readonly symbol: string }[],
  bondSpecs: readonly BridgeRingBondSpec[],
  removeAtomIds: readonly string[],
  newTemplateIndices: readonly number[],
): string {
  let best: string | null = null
  for (const order of permutations([...newTemplateIndices])) {
    const canonicalIndex = new Map(order.map((templateIndex, index) => [templateIndex, index]))
    const atoms = atomSpecs
      .map(atom => JSON.stringify([canonicalIndex.get(atom.templateIndex), atom.symbol]))
      .sort()
    const bonds = bondSpecs.map(bond => {
      const endpoints = [
        canonicalRefToken(bond.atom1, canonicalIndex),
        canonicalRefToken(bond.atom2, canonicalIndex),
      ].sort()
      return JSON.stringify([endpoints[0], endpoints[1], bond.order])
    }).sort()
    const candidate = JSON.stringify([atoms, bonds, [...removeAtomIds].sort()])
    if (best === null || candidate < best) best = candidate
  }
  return best ?? JSON.stringify([[], [], [...removeAtomIds].sort()])
}

function canonicalRefToken(ref: BridgeRingAtomRef, canonicalIndex: ReadonlyMap<number, number>): string {
  return ref.kind === 'existing'
    ? JSON.stringify(['existing', ref.atomId])
    : JSON.stringify(['new', canonicalIndex.get(ref.templateIndex)])
}

function permutations<T>(values: readonly T[]): T[][] {
  if (values.length <= 1) return [[...values]]
  const result: T[][] = []
  for (let index = 0; index < values.length; index += 1) {
    const head = values[index]!
    const rest = [...values.slice(0, index), ...values.slice(index + 1)]
    for (const tail of permutations(rest)) result.push([head, ...tail])
  }
  return result
}

function templatePairKey(first: number, second: number): string {
  return JSON.stringify(first < second ? [first, second] : [second, first])
}

function rejected(
  code: BridgeRingMappingDiagnostic['code'],
  reason: string,
): { readonly ok: false; readonly diagnostic: Omit<BridgeRingMappingDiagnostic, 'reverseFirst' | 'reverseSecond'> } {
  return { ok: false, diagnostic: { code, reason } }
}

function failure(code: BridgeRingFailureCode, reason: string): PlanBridgeRingResult {
  return { ok: false, code, reason }
}
