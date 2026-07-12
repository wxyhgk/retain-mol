/**
 * 分子优化 Worker —— 把耗时的 3D 嵌入（ConformerGenerator ~数秒）和 MMFF94 力场
 * 最小化放到后台线程，避免大分子导入/清理时冻结主线程 UI。
 *
 * 收 { id, op, mol, resourceUrl }，跑 generate3D / minimizeGeometry，回 { id, result }。
 * Molecule 是纯数据（原子/键数组），可直接结构化克隆传递。
 */
import {
  generate3D, minimizeGeometry, registerForceFieldFromUrl,
  type OptimizeResult,
} from '@retainmol/mol-viewer/optimize'
import type { MoleculeComputationRequest } from '../features/molecular-computation/domain/computationTypes'

self.onmessage = async (e: MessageEvent<MoleculeComputationRequest>) => {
  const { id, op, mol, resourceUrl } = e.data
  let result: OptimizeResult
  try {
    // ConformerGenerator 的距离几何也需要 OCL 资源（扭转角/构象参数）。
    // 注册资源不等于执行 MMFF；gen3d 分支仍然只调用 generate3D。
    await registerForceFieldFromUrl(resourceUrl)
    result = op === 'gen3d' ? generate3D(mol) : minimizeGeometry(mol)
  } catch (err) {
    result = { molecule: mol, ok: false, reason: (err as Error).message }
  }
  ;(self as unknown as Worker).postMessage({ id, result })
}
