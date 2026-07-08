import { centerMolecule } from '@retainmol/mol-viewer/core'
import { is2D, parseClipboard } from '@retainmol/mol-viewer/io'
import { useMoleculeStore } from '@/domain/viewerAdapter'
import { moleculePositionWriter } from '@/domain/moleculePositionWriter'
import { flattenMolecule, generate3DAsync, relaxAnimate } from '@/lib/moleculeOpt'
import { useUiStore } from '@/lib/uiStore'

export function pasteMoleculeText(text: string | undefined) {
  if (!text || text.length < 10) return false

  try {
    const { format, molecule } = parseClipboard(text)
    const { addToScene } = useMoleculeStore.getState()

    if (is2D(molecule)) {
      useUiStore.getState().setBusy('正在用距离几何生成 3D 结构…')
      generate3DAsync(molecule).then(async result => {
        useUiStore.getState().setBusy(null)
        const final = centerMolecule(result.ok ? result.molecule : molecule)
        if (!result.ok) {
          addToScene(final)
          return
        }
        const flatFinal = flattenMolecule(final)
        const objId = addToScene(flatFinal)
        await relaxAnimate(objId, flatFinal, { target: final, writer: moleculePositionWriter })
      })
    } else {
      addToScene(centerMolecule(molecule))
    }

    console.log(`[paste] ${format.toUpperCase()} -> ${molecule.atoms.length} atoms`)
    return true
  } catch {
    return false
  }
}
