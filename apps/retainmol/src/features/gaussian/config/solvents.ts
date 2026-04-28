/** 溶剂列表（Gaussian 关键字对应名称） */

export interface SolventOption {
  id: string      // Gaussian 关键字
  label: string   // 显示名称
  dielectric?: number  // 介电常数（参考）
}

export const SOLVENT_OPTIONS: SolventOption[] = [
  { id: 'Water',        label: '水',        dielectric: 78.36 },
  { id: 'Acetonitrile', label: '乙腈',      dielectric: 35.69 },
  { id: 'Methanol',     label: '甲醇',      dielectric: 32.61 },
  { id: 'Ethanol',      label: '乙醇',      dielectric: 24.85 },
  { id: 'DMSO',         label: 'DMSO',      dielectric: 46.83 },
  { id: 'THF',          label: 'THF',       dielectric: 7.58  },
  { id: 'DiChloroMethane', label: 'DCM',   dielectric: 8.93  },
  { id: 'Chloroform',   label: '氯仿',      dielectric: 4.71  },
  { id: 'Benzene',      label: '苯',        dielectric: 2.27  },
  { id: 'Toluene',      label: '甲苯',      dielectric: 2.37  },
  { id: 'Hexane',       label: '正己烷',    dielectric: 1.88  },
  { id: 'Acetone',      label: '丙酮',      dielectric: 20.49 },
  { id: 'DMF',          label: 'DMF',       dielectric: 37.22 },
  { id: 'CarbonTetrachloride', label: '四氯化碳', dielectric: 2.23 },
  { id: 'DiEthylEther', label: '乙醚',      dielectric: 4.24  },
]
