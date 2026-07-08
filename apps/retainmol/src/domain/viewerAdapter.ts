/**
 * App-side boundary for the mol-viewer runtime API.
 *
 * UI and domain files should import viewer state/actions from here instead of
 * depending on @retainmol/mol-viewer/viewer directly. This keeps future store
 * reshaping or package splits localized to one adapter.
 */
export * from '@retainmol/mol-viewer/viewer'
