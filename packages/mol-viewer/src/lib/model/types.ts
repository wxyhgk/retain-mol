/** Pure molecular data contracts. No editor, presentation or runtime dependencies. */

/** 跨 Builder/Renderer 边界使用的只读三维向量 DTO。 */
export interface Vector3Data {
  readonly x: number
  readonly y: number
  readonly z: number
}

export type CoordinationBondOrder = 1 | 2 | 3

export interface CoordinationSite {
  readonly id: string
  readonly label: string
  readonly direction: readonly [number, number, number]
  readonly bondOrder: CoordinationBondOrder
  readonly equivalenceGroup: string
}

export interface CoordinationSiteAssignment {
  readonly atomId: string
  readonly siteId: string
}

export interface Atom {
  readonly id: string
  readonly symbol: string
  /** Explicit isotope mass number (e.g. 13 for carbon-13), not an atomic weight. */
  readonly isotope?: number
  readonly x: number
  readonly y: number
  readonly z: number
  /** 形式电荷（价态完整模型下会改变该原子的有效成键数） */
  readonly charge?: number
  /** 未配对电子数（自由基）；每个占一个价位，不代表整个体系的自旋多重度。 */
  readonly radical?: number
  /**
   * 四面体手性（R/S，由取代基 CIP 排名确定）。缺席 = 未指定，绝不默认为某一种。
   * 显示/哈希/计算读它；楔形画法另存 Bond.wedge，两者由命令层保持一致。
   */
  readonly chirality?: 'R' | 'S'
  readonly label?: string
  /** Builder-authored transition-metal coordination preset. */
  readonly coordinationGeometry?: string
  /** World-space unit vectors for the authored coordination sites. */
  readonly coordinationDirections?: readonly (readonly [number, number, number])[]
  /** Stable authored sites. Directions are transformed into molecule coordinates. */
  readonly coordinationSites?: readonly CoordinationSite[]
  /** Hard bonding capacity supplied by the selected coordination preset. */
  readonly coordinationNumber?: number
}

export interface Bond {
  readonly id: string
  readonly atomId1: string
  readonly atomId2: string
  readonly order: 1 | 2 | 3
  readonly aromatic?: boolean
  /**
   * 楔形键：窄端在 atomId1，up=实楔（出纸）、down=虚楔（入纸）。
   * 缺席 = 无楔形标注。SDF/V2000 往返的保真载体。
   */
  readonly wedge?: 'up' | 'down'
  /** 双键顺反（E/Z）。缺席 = 未指定。 */
  readonly ez?: 'E' | 'Z'
  /** Coordination sites consumed at either endpoint of this bond. */
  readonly coordinationSites?: readonly CoordinationSiteAssignment[]
}

export interface Molecule {
  readonly atoms: readonly Atom[]
  readonly bonds: readonly Bond[]
  readonly name?: string
}

