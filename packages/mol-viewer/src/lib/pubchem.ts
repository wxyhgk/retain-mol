/**
 * PubChem REST API 封装
 * 免费、无需 token，速率限制 5 req/s
 * https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
 */

const BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug'

export interface PubChemResult {
  sdf: string
  name: string
  cid: number
}

/**
 * 按名称或 CAS 号获取 3D SDF。
 * 若无 3D 构型则回退到 2D（调用方可用 is2D 检测）。
 */
export async function fetchCompoundSdf(query: string): Promise<PubChemResult> {
  const q = encodeURIComponent(query.trim())

  // 先尝试 3D 构型
  const url3d = `${BASE}/compound/name/${q}/SDF?record_type=3d`
  const res3d = await fetch(url3d)

  let sdf: string
  if (res3d.ok) {
    sdf = await res3d.text()
  } else if (res3d.status === 404) {
    // 回退 2D
    const url2d = `${BASE}/compound/name/${q}/SDF`
    const res2d = await fetch(url2d)
    if (!res2d.ok) {
      if (res2d.status === 404) throw new Error(`未找到化合物：${query}`)
      throw new Error(`PubChem 请求失败 (${res2d.status})`)
    }
    sdf = await res2d.text()
  } else {
    throw new Error(`PubChem 请求失败 (${res3d.status})`)
  }

  // 从 SDF 中提取 CID 和名称
  const cidMatch = sdf.match(/> <PUBCHEM_COMPOUND_CID>\n(\d+)/)
  const cidText = cidMatch?.[1]
  const cid = cidText ? Number.parseInt(cidText, 10) : 0

  return { sdf, name: query, cid }
}
