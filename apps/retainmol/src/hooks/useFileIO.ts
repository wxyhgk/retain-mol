/**
 * useFileIO — 分子文件导入/导出逻辑
 * 支持格式：XYZ、MOL（V2000）、SDF
 */

import { useCallback } from 'react'
import { useMoleculeStore, selectActiveMoleculeOrEmpty } from '@/store/moleculeStore'
import { parseXYZ, exportXYZ, centerMolecule } from '@/lib/molecule'
import { parseMol, parseSdf, exportMol, exportSdf, is2D } from '@/lib/io/molFormat'

function download(text: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
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
    pickFile('.mol,.sdf', (text, filename) => {
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
        if (is2D(mol)) {
          alert('检测到 2D 文件（所有 z=0），分子会显示为平面。建议用 RDKit / OpenBabel / Avogadro 先转成 3D 构型再导入。')
        }
        setMolecule(centerMolecule(mol))
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
    pickFile('.mol,.sdf', (text, filename) => {
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
        if (is2D(mol)) {
          alert('检测到 2D 文件（所有 z=0），分子会显示为平面。建议用 RDKit / OpenBabel / Avogadro 先转成 3D 构型再导入。')
        }
        addToScene(centerMolecule(mol))
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

  return { importXYZ, importMolSdf, importXYZToScene, importMolSdfToScene, exportCurrentXYZ, exportCurrentMol, exportCurrentSdf }
}

function pickFile(accept: string, onLoad: (text: string, filename: string) => void) {
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
