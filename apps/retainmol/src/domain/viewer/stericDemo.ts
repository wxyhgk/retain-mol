import { createViewerRuntime, getViewerApi } from '@retainmol/mol-viewer/runtime'
import { commitEditPlan, getModelingContext } from '@retainmol/mol-viewer/modeling'
import { analyzeStericContacts, computeMoleculeRevision, dryRunEditPlan, type TorsionCandidate } from '@retainmol/mol-viewer/headless'
export { MolViewer as StericViewport } from '@retainmol/mol-viewer/viewer'

export function createStericDemoSession() {
  const currentRuntime = createViewerRuntime()
  const previewRuntime = createViewerRuntime()
  const currentApi = getViewerApi(currentRuntime)
  const previewApi = getViewerApi(previewRuntime)
  return {
    currentRuntime, previewRuntime, currentApi, previewApi,
    getContext: () => getModelingContext(currentRuntime),
    apply(candidate: TorsionCandidate) {
      const context = getModelingContext(currentRuntime)
      const result = dryRunEditPlan(context, candidate.plan)
      if (!result.ok) throw new Error(result.issues.map(i => i.message).join('；'))
      if (computeMoleculeRevision(result.molecule) !== candidate.revision) throw new Error('候选预览不匹配，请重新分析')
      const report = analyzeStericContacts(result.molecule)
      if (!report.supported || report.hardClashCount) throw new Error('候选未通过碰撞复核')
      const committed = commitEditPlan(candidate.plan, currentRuntime)
      if (!committed.ok) throw new Error(committed.issues.map(i => i.message).join('；'))
      return committed
    },
    dispose() { currentRuntime.dispose(); previewRuntime.dispose() },
  }
}
export type StericDemoSession = ReturnType<typeof createStericDemoSession>
