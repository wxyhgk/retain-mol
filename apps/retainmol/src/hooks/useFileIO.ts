/**
 * useFileIO — 分子文件导入/导出逻辑
 * 支持格式：XYZ、MOL（V2000）、SDF
 */

import { useCallback } from 'react'
import { selectActiveMoleculeOrEmpty, useMoleculeStore } from '@/domain/viewer/moleculeState'
import { captureViewportImage } from '@/domain/viewer/viewport'
import { exportXYZ } from '@retainmol/mol-viewer/core'
import { exportGJF, exportMol, exportSdf } from '@retainmol/mol-viewer/io'
import { parseMoleculeFile, placeMoleculeInViewer } from '@/features/molecule-placement'

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

  const importFiles = useCallback(async (files: readonly File[], mode: 'replace' | 'add-to-scene' = 'replace') => {
    const file = files[0]
    if (!file) return
    const parsed = await parseMoleculeFile(file)
    if (parsed.moleculeCount > 1) alert(`SDF 包含 ${parsed.moleculeCount} 个分子，已导入第一个`)
    const placedId = await placeMoleculeInViewer(parsed.molecule, {
      mode,
      animate2DTo3D: !file.name.toLowerCase().endsWith('.xyz'),
    })
    // 门控丢弃（另有放置任务在跑）不抛错：明确告诉用户，否则像点了没反应
    if (!placedId) alert('导入被丢弃：有其他放置任务正在进行，请稍后重试')
  }, [])

  const importXYZ = useCallback(() => {
    pickFiles('.xyz', files => importFiles(files, 'replace'))
  }, [importFiles])

  const importMolSdf = useCallback(() => {
    pickFiles('.mol,.sdf', files => importFiles(files, 'replace'))
  }, [importFiles])

  // ── 导入（添加到场景） ──────────────────────────────────────

  const importXYZToScene = useCallback(() => {
    pickFiles('.xyz', files => importFiles(files, 'add-to-scene'))
  }, [importFiles])

  const importMolSdfToScene = useCallback(() => {
    pickFiles('.mol,.sdf', files => importFiles(files, 'add-to-scene'))
  }, [importFiles])

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
    importFiles, importXYZ, importMolSdf, importXYZToScene, importMolSdfToScene,
    exportCurrentXYZ, exportCurrentMol, exportCurrentSdf, exportCurrentGJF, exportPNG,
  }
}

function pickFiles(accept: string, onLoad: (files: File[]) => void | Promise<void>) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = accept
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    void Promise.resolve(onLoad([file])).catch(error => alert(`文件解析失败：${error instanceof Error ? error.message : '格式无效'}`))
  }
  input.click()
}
