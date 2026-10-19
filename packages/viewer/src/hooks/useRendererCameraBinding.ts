import { useEffect, useRef } from 'react'
import { toolCan } from '../config/toolCapabilities.config'
import type { RendererCameraBindingOptions } from './rendererSceneBindingTypes'

export function useRendererCameraBinding({
  rendererRef,
  activeTool,
  sceneObjects,
  activeObjectId,
}: RendererCameraBindingOptions) {
  const previousMoleculeNameRef = useRef<string | undefined>(undefined)
  const previousActiveIdRef = useRef(activeObjectId ?? '')

  useEffect(() => {
    const renderer = rendererRef.current
    const activeObject = sceneObjects.find(object => object.id === activeObjectId)
    if (!renderer || !activeObject) return

    const changed = activeObject.molecule.name !== previousMoleculeNameRef.current
      || activeObjectId !== previousActiveIdRef.current
    previousMoleculeNameRef.current = activeObject.molecule.name
    previousActiveIdRef.current = activeObjectId ?? ''

    if (activeObject.molecule.atoms.length === 0 || toolCan(activeTool, 'transformsObject')) return
    if (changed) renderer.fitToMolecule([...activeObject.molecule.atoms])
    else renderer.updateOrbitTarget(activeObject.molecule.atoms)
  }, [sceneObjects, activeObjectId, activeTool, rendererRef])
}
