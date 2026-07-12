import { useEffect } from 'react'
import * as THREE from 'three'
import { resolveTheme, type ResolvedTheme } from '../presets'
import type { RenderStyle } from '../styles'
import type { RendererSceneStateBindingOptions } from './rendererSceneBindingTypes'

export function resolveRendererTheme(
  theme: ResolvedTheme,
  renderStyle: RenderStyle,
  appearance: 'day' | 'night',
): ResolvedTheme {
  const selectedTheme = renderStyle === 'iboview' && theme.metadata.id !== 'iboview'
    ? resolveTheme('iboview')
    : theme
  if (appearance !== 'night') return selectedTheme

  const nightTheme = resolveTheme('dark')
  return {
    ...nightTheme,
    scene: {
      ...nightTheme.scene,
      backgroundColor: '#000000',
      highlightColor: '#ffffff',
    },
  }
}

export function useRendererSceneStateBinding({
  rendererRef,
  sceneObjects,
  activeObjectId,
  selectedAtomIds,
  selectedBondIds,
  displayMode,
  renderStyle,
  theme,
  appearance,
}: RendererSceneStateBindingOptions) {
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    const rendererTheme = resolveRendererTheme(theme, renderStyle, appearance)
    renderer.theme = rendererTheme
    renderer.setRenderStyle(renderStyle)
    renderer.scene.background = new THREE.Color(
      parseInt(rendererTheme.scene.backgroundColor.replace('#', ''), 16),
    )
  }, [theme, renderStyle, appearance, rendererRef])

  useEffect(() => {
    rendererRef.current?.renderScene(
      sceneObjects,
      activeObjectId,
      displayMode,
      selectedAtomIds,
      selectedBondIds,
    )
  }, [sceneObjects, activeObjectId, displayMode, selectedAtomIds, selectedBondIds, theme, renderStyle, appearance, rendererRef])
}
