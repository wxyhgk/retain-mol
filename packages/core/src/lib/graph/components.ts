import type { Molecule } from '../model/types'

/**
 * BFS：返回与 startId 连通的所有原子 ID 集合。
 */
export function getConnectedFragment(
  atoms: readonly { id: string }[],
  bonds: readonly { atomId1: string; atomId2: string }[],
  startId: string,
): Set<string> {
  const adj = new Map<string, string[]>()
  for (const a of atoms) adj.set(a.id, [])
  for (const b of bonds) {
    adj.get(b.atomId1)?.push(b.atomId2)
    adj.get(b.atomId2)?.push(b.atomId1)
  }
  const visited = new Set<string>()
  const queue = [startId]
  while (queue.length) {
    const id = queue.pop()!
    if (visited.has(id)) continue
    visited.add(id)
    for (const nb of adj.get(id) ?? []) if (!visited.has(nb)) queue.push(nb)
  }
  return visited
}

/**
 * 把分子按连通分量拆成多个子分子。只有一个分量时返回原始数组。
 */
export function splitConnectedComponents(mol: Molecule): Molecule[] {
  const visited = new Set<string>()
  const components: string[][] = []
  for (const atom of mol.atoms) {
    if (visited.has(atom.id)) continue
    const comp = getConnectedFragment(mol.atoms, mol.bonds, atom.id)
    comp.forEach(id => visited.add(id))
    components.push([...comp])
  }
  if (components.length <= 1) return [mol]

  const atomById = new Map(mol.atoms.map(a => [a.id, a]))
  return components.map((ids, i) => {
    const idSet = new Set(ids)
    return {
      atoms: ids.map(id => atomById.get(id)!),
      bonds: mol.bonds.filter(b => idSet.has(b.atomId1) && idSet.has(b.atomId2)),
      name: `${mol.name ?? 'Molecule'} ${i + 1}`,
    }
  })
}
