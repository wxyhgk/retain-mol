/** Compatibility entry combining pure plans with viewer runtime adapters. */
export * from './headless'
export type { ViewerRuntime } from '../runtime/ViewerRuntime'
export { getModelingContext, commitEditPlan } from '../runtime/modelingApi'

export {
  commitSelectedBondFragmentFusion,
  previewSelectedBondFragmentFusion,
} from '../runtime/selectedBondFragmentFusionRuntime'
export type {
  SelectedBondFragmentFusionCandidate,
  SelectedBondFragmentFusionCommitInput,
  SelectedBondFragmentFusionCommitResult,
  SelectedBondFragmentFusionCommitSuccess,
  SelectedBondFragmentFusionDiagnostic,
  SelectedBondFragmentFusionEffect,
  SelectedBondFragmentFusionFailure,
  SelectedBondFragmentFusionFailureCode,
  SelectedBondFragmentFusionPreview,
  SelectedBondFragmentFusionPreviewInput,
  SelectedBondFragmentFusionPreviewResult,
} from '../runtime/selectedBondFragmentFusionRuntime'
