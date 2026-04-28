import type { Molecule } from '@/lib/molecule'
import type { GaussianJobConfig } from '../types'

/**
 * 根据配置和分子生成 Gaussian .gjf 输入文件内容。
 * 纯函数，无副作用。
 */
export function generateGaussianInput(mol: Molecule, cfg: GaussianJobConfig): string {
  const title = cfg.title || mol.name || 'molecule'
  const chkName = (cfg.checkpointFile || title).replace(/\s+/g, '_')

  // ── Route 行 ──
  let keywords = `${cfg.calcType}`

  if (cfg.dispersion) keywords += ` EmpiricalDispersion=${cfg.dispersion}`
  if (cfg.gridType)   keywords += ` Integral=(Grid=${cfg.gridType})`
  if (cfg.solventModel !== 'none' && cfg.solvent) {
    keywords += ` SCRF=(${cfg.solventModel},Solvent=${cfg.solvent})`
  }
  if (cfg.extraKeywords.trim()) keywords += ` ${cfg.extraKeywords.trim()}`

  const route = `# ${cfg.method}/${cfg.basisSet} ${keywords}`

  const lines: string[] = []

  // Link 0
  lines.push(`%chk=${chkName}.chk`)
  lines.push(`%mem=${cfg.memory}`)
  lines.push(`%nprocshared=${cfg.nproc}`)

  // Route + 空行
  lines.push(route)
  lines.push('')

  // 标题 + 空行
  lines.push(title)
  lines.push('')

  // 电荷 多重度
  lines.push(`${cfg.charge} ${cfg.multiplicity}`)

  // 坐标
  for (const atom of mol.atoms) {
    const sym = atom.symbol.padEnd(3)
    const x   = atom.x.toFixed(6).padStart(14)
    const y   = atom.y.toFixed(6).padStart(14)
    const z   = atom.z.toFixed(6).padStart(14)
    lines.push(` ${sym} ${x}  ${y}  ${z}`)
  }

  // 末尾两个空行（Gaussian 要求）
  lines.push('')
  lines.push('')

  return lines.join('\n')
}
