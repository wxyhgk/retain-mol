/**
 * useFileIO — 分子文件导入/导出逻辑
 * 支持格式：XYZ、MOL（V2000）、SDF
 */

import { useCallback } from 'react'
import {
  useMoleculeStore, selectActiveMoleculeOrEmpty,
  parseXYZ, exportXYZ, exportGJF, centerMolecule,
  parseMol, parseSdf, exportMol, exportSdf, is2D,
  captureViewportImage,
} from '@retainmol/mol-viewer'
import { generate3DAsync, relaxAnimate, flattenMolecule } from '@/lib/moleculeOpt'
import { useUiStore } from '@/lib/uiStore'

/**
 * 导入并（若是 2D）立体化：用 ConformerGenerator（成熟的距离几何，环正确、自动含 H）
 * 生成高质量最终结构，再用几何松弛器从平面逐帧展开、锚定到该结构——既能看到展开过程，
 * 终点又精确等于 CG 结果。非 2D 直接放入。place(mol) 返回落地对象的 id。
 */
async function importWith3D(mol: import('@retainmol/mol-viewer').Molecule, place: (m: import('@retainmol/mol-viewer').Molecule) => string) {
  if (!is2D(mol)) { place(centerMolecule(mol)); return }
  useUiStore.getState().setBusy('正在用距离几何生成 3D 结构…')
  const r = await generate3DAsync(mol)
  useUiStore.getState().setBusy(null)
  const final = centerMolecule(r.ok ? r.molecule : mol)
  if (!r.ok) { place(final); return }
  // 以「压平的 CG 结果」落地（含 H、环已正确排布的平面态），逐帧松弛 + 锚定展开成 3D
  const flatFinal = flattenMolecule(final)
  const objId = place(flatFinal)
  await relaxAnimate(objId, flatFinal, { target: final })
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
        // 2D 结构自动立体化 + 平面折叠动画（替换当前分子）
        await importWith3D(mol, (m) => {
          setMolecule(m)
          return useMoleculeStore.getState().activeObjectId!
        })
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
        // 2D 结构自动立体化 + 平面折叠动画（添加到场景）
        await importWith3D(mol, (m) => addToScene(m))
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
