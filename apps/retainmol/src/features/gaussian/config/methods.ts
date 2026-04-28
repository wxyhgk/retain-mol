/** 计算方法分组列表（供 UI 选择器使用） */

export interface MethodGroup {
  group: string
  items: { id: string; label: string; desc?: string }[]
}

export const METHOD_GROUPS: MethodGroup[] = [
  {
    group: 'GGA 泛函',
    items: [
      { id: 'BLYP',    label: 'BLYP' },
      { id: 'PBE',     label: 'PBE' },
      { id: 'BP86',    label: 'BP86' },
    ],
  },
  {
    group: '杂化泛函（推荐）',
    items: [
      { id: 'B3LYP',   label: 'B3LYP',   desc: '最常用，综合性能好' },
      { id: 'PBE0',    label: 'PBE0' },
      { id: 'M06-2X',  label: 'M06-2X',  desc: '非共价相互作用好' },
      { id: 'wB97X-D', label: 'ωB97X-D', desc: '含色散，范围分离' },
      { id: 'CAM-B3LYP', label: 'CAM-B3LYP', desc: '范围分离，激发态' },
    ],
  },
  {
    group: '双杂化泛函',
    items: [
      { id: 'B2PLYP',       label: 'B2PLYP' },
      { id: 'B2PLYP-D3',    label: 'B2PLYP-D3' },
      { id: 'wB97X-2',      label: 'ωB97X-2' },
    ],
  },
  {
    group: 'HF / 波函数方法',
    items: [
      { id: 'HF',       label: 'HF',       desc: 'Hartree-Fock' },
      { id: 'MP2',      label: 'MP2',      desc: '二阶微扰' },
      { id: 'CCSD',     label: 'CCSD',     desc: '耦合簇' },
      { id: 'CCSD(T)',  label: 'CCSD(T)',  desc: "金标准" },
    ],
  },
  {
    group: '半经验方法',
    items: [
      { id: 'AM1',  label: 'AM1' },
      { id: 'PM3',  label: 'PM3' },
      { id: 'PM6',  label: 'PM6' },
      { id: 'PM7',  label: 'PM7' },
    ],
  },
]

export const ALL_METHODS = METHOD_GROUPS.flatMap(g => g.items.map(i => i.id))
