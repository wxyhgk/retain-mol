import { createViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
import { commitEditPlan, getModelingContext } from '@retainmol/mol-viewer/modeling'
import { computeMoleculeRevision, dryRunEditPlan, previewConstrainedGeometry } from '@retainmol/mol-viewer/headless'
import type { RendererPort } from '@retainmol/mol-viewer/viewer'
export { MolViewer as ConstrainedGeometryViewport } from '@retainmol/mol-viewer/viewer'
export { previewConstrainedGeometry }
export type ConstraintPreview = Extract<ReturnType<typeof previewConstrainedGeometry>, { ok: true }>
export type ConstrainedGeometryRenderer = RendererPort
type ViewportSide = 'current' | 'preview'

function alignDemoView(renderer: RendererPort | null) {
  renderer?.alignViewToPlane?.([0.25, -0.9, 0.45])
}

export function createConstrainedGeometrySession() {
  const currentRuntime = createViewerRuntime()
  const previewRuntime = createViewerRuntime()
  const currentApi = getViewerApi(currentRuntime)
  const previewApi = getViewerApi(previewRuntime)
  const renderers: Record<ViewportSide, RendererPort | null> = { current: null, preview: null }
  const initialFrames: Record<ViewportSide, number | null> = { current: null, preview: null }
  const fit = (side: ViewportSide) => {
    const api = side === 'current' ? currentApi : previewApi
    api.view.fit()
    alignDemoView(renderers[side])
  }
  return {
    currentRuntime, previewRuntime, currentApi, previewApi,
    fit,
    bindRenderer(side: ViewportSide, renderer: RendererPort | null) {
      if (initialFrames[side] !== null) cancelAnimationFrame(initialFrames[side])
      renderers[side] = renderer
      initialFrames[side] = renderer ? requestAnimationFrame(() => {
        initialFrames[side] = null
        // The viewer's initial scene effect also fits; set the shared angle after it.
        if (renderers[side] === renderer) fit(side)
      }) : null
    },
    focus(side: ViewportSide, atomIds: readonly string[]) {
      const api = side === 'current' ? currentApi : previewApi
      api.selection.set([...atomIds]); api.view.focusSelection()
      alignDemoView(renderers[side])
    },
    getContext: () => getModelingContext(currentRuntime),
    apply(preview: ConstraintPreview) {
      const result = dryRunEditPlan(getModelingContext(currentRuntime), preview.plan)
      if (!result.ok) throw new Error(result.issues.map(issue => issue.message).join('；'))
      if (computeMoleculeRevision(result.molecule) !== preview.nextRevision
        || computeMoleculeRevision(preview.molecule) !== preview.nextRevision) {
        throw new Error('预览与命令结果不匹配，请重新生成预览')
      }
      const committed = commitEditPlan(preview.plan, currentRuntime)
      if (!committed.ok) throw new Error(committed.issues.map(issue => issue.message).join('；'))
      return committed
    },
    dispose() {
      for (const side of ['current', 'preview'] as const) {
        if (initialFrames[side] !== null) cancelAnimationFrame(initialFrames[side])
        renderers[side] = null
      }
      currentRuntime.dispose(); previewRuntime.dispose()
    },
  }
}
export type ConstrainedGeometrySession = ReturnType<typeof createConstrainedGeometrySession>
