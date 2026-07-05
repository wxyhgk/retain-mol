/**
 * useFileIO — 分子文件导入/导出逻辑
 * 支持格式：XYZ、MOL（V2000）、SDF
 */

import { useCallback } from 'react'
import {
  useMoleculeStore, selectActiveMoleculeOrEmpty,
  parseXYZ, exportXYZ, exportGJF, centerMolecule,
  parseMol, parseSdf, exportMol, exportSdf, is2D,
  generate3D, registerForceFieldFromUrl,
  captureViewportImage,
} from '@retainmol/mol-viewer'
import type { Molecule } from '@retainmol/mol-viewer'

const OCL_RESOURCE_URL = `${import.meta.env.BASE_URL}ocl/resources.json`

/**
 * 2D 结构自动立体化（Chem3D 式）：ConformerGenerator 嵌入 3D + MMFF94 清理。
 * 需要 OCL 力场资源就绪，先 await 注册（幂等）。生成失败则退回原平面结构。
 */
async function make3DIfFlat(mol: Molecule): Promise<Molecule> {
  if (!is2D(mol)) return mol
  try { await registerForceFieldFromUrl(OCL_RESOURCE_URL) } catch { /* 资源加载失败则用纯嵌入 */ }
  const r = generate3D(mol)
  return r.ok ? r.molecule : mol
}

function download(text: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

export function useFileIO() {
  const { setMolecule, addToScene } = useMoleculeStore()
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const molName = molecule.name ?? 'molecule'

  // ── 导入（替换当前） ──────────────────────────────────────

  const importXYZ = useCallback(() => {
    pickFile('.xyz', (text) => {
      try {
        setMolecule(centerMolecule(parseXYZ(text)))
      } catch {
        alert('XYZ 文件解析失败，请检查格式')
      }
    })
  }, [setMolecule])

  const importMolSdf = useCallback(() => {
    pickFile('.mol,.sdf', async (text, filename) => {
      try {
        const isSdf = filename.toLowerCase().endsWith('.sdf')
        let mol
        if (isSdf) {
          const mols = parseSdf(text)
          if (mols.length === 0) { alert('SDF 文件中未找到有效分子'); return }
          if (mols.length > 1) alert(`SDF 包含 ${mols.length} 个分子，已导入第一个`)
          mol = mols[0]
        } else {
          mol = parseMol(text)
        }
        // 2D 结构自动立体化（导入 2D SDF 直接得到可用的 3D）
        const mol3d = await make3DIfFlat(mol)
        setMolecule(centerMolecule(mol3d))
      } catch (e) {
        alert(`文件解析失败：${(e as Error).message}`)
      }
    })
  }, [setMolecule])

  // ── 导入（添加到场景） ──────────────────────────────────────

  const importXYZToScene = useCallback(() => {
    pickFile('.xyz', (text) => {
      try {
        addToScene(centerMolecule(parseXYZ(text)))
      } catch {
        alert('XYZ 文件解析失败，请检查格式')
      }
    })
  }, [addToScene])

  const importMolSdfToScene = useCallback(() => {
    pickFile('.mol,.sdf', async (text, filename) => {
      try {
        const isSdf = filename.toLowerCase().endsWith('.sdf')
        let mol
        if (isSdf) {
          const mols = parseSdf(text)
          if (mols.length === 0) { alert('SDF 文件中未找到有效分子'); return }
          if (mols.length > 1) alert(`SDF 包含 ${mols.length} 个分子，已导入第一个`)
          mol = mols[0]
        } else {
          mol = parseMol(text)
        }
        const mol3d = await make3DIfFlat(mol)
        addToScene(centerMolecule(mol3d))
      } catch (e) {
        alert(`文件解析失败：${(e as Error).message}`)
      }
    })
  }, [addToScene])

  // ── 导出 ──────────────────────────────────────

  const exportCurrentXYZ = useCallback(() => {
    download(exportXYZ(molecule), `${molName}.xyz`)
  }, [molecule, molName])

  const exportCurrentMol = useCallback(() => {
    download(exportMol(molecule), `${molName}.mol`)
  }, [molecule, molName])

  const exportCurrentSdf = useCallback(() => {
    download(exportSdf(molecule), `${molName}.sdf`)
  }, [molecule, molName])

  const exportCurrentGJF = useCallback(() => {
    download(exportGJF(molecule), `${molName}.gjf`)
  }, [molecule, molName])

  // 视口 PNG 截图（2 倍高清；无原子时不导空图）
  const exportPNG = useCallback(() => {
    if (molecule.atoms.length === 0) return
    const url = captureViewportImage(2)
    if (url) downloadDataUrl(url, `${molName}.png`)
  }, [molecule, molName])

  return {
    importXYZ, importMolSdf, importXYZToScene, importMolSdfToScene,
    exportCurrentXYZ, exportCurrentMol, exportCurrentSdf, exportCurrentGJF, exportPNG,
  }
}

function pickFile(accept: string, onLoad: (text: string, filename: string) => void | Promise<void>) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onLoad(ev.target?.result as string, file.name)
    reader.readAsText(file)
  }
  input.click()
}
