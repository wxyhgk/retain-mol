/**
 * useFileIO — 分子文件导入/导出逻辑
 * 支持格式：XYZ、MOL（V2000）、SDF
 */

import { useCallback } from 'react'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { captureViewportImage } from '@/domain/viewer/viewport'
import { parseXYZ, exportXYZ } from '@retainmol/mol-viewer/core'
import { exportGJF, parseMol, parseSdf, exportMol, exportSdf } from '@retainmol/mol-viewer/io'
import { placeMoleculeInViewer } from '@/features/molecule-placement'

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
  const molecule = useMoleculeStore(selectActiveMoleculeOrEmpty)
  const molName = molecule.name ?? 'molecule'

  // ── 导入（替换当前） ──────────────────────────────────────

  const importXYZ = useCallback(() => {
    pickFile('.xyz', (text) => {
      try {
        void placeMoleculeInViewer(parseXYZ(text), { mode: 'replace', animate2DTo3D: false })
      } catch {
        alert('XYZ 文件解析失败，请检查格式')
      }
    })
  }, [])

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
        await placeMoleculeInViewer(mol, { mode: 'replace' })
      } catch (e) {
        alert(`文件解析失败：${(e as Error).message}`)
      }
    })
  }, [])

  // ── 导入（添加到场景） ──────────────────────────────────────

  const importXYZToScene = useCallback(() => {
    pickFile('.xyz', (text) => {
      try {
        void placeMoleculeInViewer(parseXYZ(text), { mode: 'add-to-scene', animate2DTo3D: false })
      } catch {
        alert('XYZ 文件解析失败，请检查格式')
      }
    })
  }, [])

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
        await placeMoleculeInViewer(mol, { mode: 'add-to-scene' })
      } catch (e) {
        alert(`文件解析失败：${(e as Error).message}`)
      }
    })
  }, [])

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
    const url = captureViewportImage()
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
