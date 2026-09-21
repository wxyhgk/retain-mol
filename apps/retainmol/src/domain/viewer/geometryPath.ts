import { createViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
import { commitEditPlan, getModelingContext } from '@retainmol/mol-viewer/modeling'
import { computeMoleculeRevision, dryRunEditPlan, previewConstrainedGeometry, validateGeometryMotion } from '@retainmol/mol-viewer/headless'
import type { RendererPort } from '@retainmol/mol-viewer/viewer'

export { MolViewer as GeometryPathViewport } from '@retainmol/mol-viewer/viewer'
export {
  computeMoleculeRevision, previewConstrainedGeometry, validateGeometryMotion,
  createRibbonGuide, validateRibbonRegion, measureRibbonGeometry,
} from '@retainmol/mol-viewer/headless'
export type {
  Molecule, ConstrainedGeometryRequest, GeometryMotionReport, GeometryMotionIssue,
  GeometryRibbonRegion,
} from '@retainmol/mol-viewer/headless'
export type GeometryPathRenderer = RendererPort
export type GeometryPathPreview = Extract<ReturnType<typeof previewConstrainedGeometry>, { ok: true }>
type Side = 'current' | 'preview'

export function createGeometryPathSession() {
  const currentRuntime = createViewerRuntime(), previewRuntime = createViewerRuntime()
  const currentApi = getViewerApi(currentRuntime), previewApi = getViewerApi(previewRuntime)
  const renderers: Record<Side, RendererPort | null> = { current: null, preview: null }
  const frames: Record<Side, number | null> = { current: null, preview: null }
  const fit = (side: Side) => {
    ;(side === 'current' ? currentApi : previewApi).view.fit()
    renderers[side]?.alignViewToPlane?.([0.35, -0.8, 0.7])
  }
  return {
    currentRuntime, previewRuntime, currentApi, previewApi, fit,
    bindRenderer(side: Side, renderer: RendererPort | null) {
      if (frames[side] !== null) cancelAnimationFrame(frames[side])
      renderers[side] = renderer
      frames[side] = renderer ? requestAnimationFrame(() => {
        frames[side] = null
        if (renderers[side] === renderer) fit(side)
      }) : null
    },
    focus(side: Side, atomIds: readonly string[], bondIds: readonly string[] = []) {
      const api = side === 'current' ? currentApi : previewApi
      api.selection.set(atomIds, bondIds); api.view.focusSelection()
      renderers[side]?.alignViewToPlane?.([0.35, -0.8, 0.7])
    },
    getContext: () => getModelingContext(currentRuntime),
    apply(preview: GeometryPathPreview) {
      const context = getModelingContext(currentRuntime)
      const replay = dryRunEditPlan(context, preview.plan)
      if (!replay.ok) throw new Error(replay.issues.map(issue => issue.message).join('；'))
      if (computeMoleculeRevision(replay.molecule) !== preview.nextRevision || computeMoleculeRevision(preview.molecule) !== preview.nextRevision) {
        throw new Error('预览已变化，请重新检查运动')
      }
      const checked = validateGeometryMotion(currentApi.getSnapshot().molecule, replay.molecule)
      if (!checked.safe) throw new Error('线性运动未通过安全检查，无法应用')
      const committed = commitEditPlan(preview.plan, currentRuntime)
      if (!committed.ok) throw new Error(committed.issues.map(issue => issue.message).join('；'))
      return committed
    },
    dispose() {
      for (const side of ['current', 'preview'] as const) {
        if (frames[side] !== null) cancelAnimationFrame(frames[side])
        renderers[side] = null
      }
      currentRuntime.dispose(); previewRuntime.dispose()
    },
  }
}
export type GeometryPathSession = ReturnType<typeof createGeometryPathSession>
