/** 基组分组列表 */

export interface BasisSetGroup {
  group: string
  items: { id: string; label: string; desc?: string }[]
}

export const BASIS_SET_GROUPS: BasisSetGroup[] = [
  {
    group: 'Pople（常用）',
    items: [
      { id: 'STO-3G',           label: 'STO-3G',           desc: '最小基，速度最快' },
      { id: '3-21G',            label: '3-21G' },
      { id: '6-31G(d)',         label: '6-31G(d)',          desc: '常用，有极化' },
      { id: '6-31G(d,p)',       label: '6-31G(d,p)' },
      { id: '6-31+G(d,p)',      label: '6-31+G(d,p)',       desc: '含弥散，适合阴离子' },
      { id: '6-311+G(d,p)',     label: '6-311+G(d,p)',      desc: '三 zeta' },
      { id: '6-311++G(2d,2p)',  label: '6-311++G(2d,2p)',   desc: '高精度 Pople' },
    ],
  },
  {
    group: 'Dunning（高精度）',
    items: [
      { id: 'cc-pVDZ',     label: 'cc-pVDZ' },
      { id: 'cc-pVTZ',     label: 'cc-pVTZ',     desc: '三 zeta' },
      { id: 'cc-pVQZ',     label: 'cc-pVQZ',     desc: '四 zeta' },
      { id: 'aug-cc-pVDZ', label: 'aug-cc-pVDZ', desc: '含弥散' },
      { id: 'aug-cc-pVTZ', label: 'aug-cc-pVTZ' },
    ],
  },
  {
    group: 'Ahlrichs（速度佳）',
    items: [
      { id: 'def2-SVP',   label: 'def2-SVP',   desc: '双 zeta，快速' },
      { id: 'def2-TZVP',  label: 'def2-TZVP',  desc: '三 zeta，推荐' },
      { id: 'def2-TZVPP', label: 'def2-TZVPP' },
      { id: 'def2-QZVP',  label: 'def2-QZVP',  desc: '四 zeta' },
    ],
  },
  {
    group: '赝势基组（重原子）',
    items: [
      { id: 'LANL2DZ',   label: 'LANL2DZ',   desc: '过渡金属常用' },
      { id: 'SDD',       label: 'SDD' },
      { id: 'CEP-31G',   label: 'CEP-31G' },
    ],
  },
]

export const ALL_BASIS_SETS = BASIS_SET_GROUPS.flatMap(g => g.items.map(i => i.id))
