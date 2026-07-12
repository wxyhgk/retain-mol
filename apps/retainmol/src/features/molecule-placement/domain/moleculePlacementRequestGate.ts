import type { Molecule } from '@retainmol/mol-viewer/core'

export type MoleculePlacementMode = 'replace' | 'add-to-scene'

type PlacementState = {
  readonly activeObjectId: string | null
  readonly objectsById: Readonly<Record<string, { readonly molecule: Molecule }>>
}

export type MoleculePlacementRequest = {
  readonly mode: MoleculePlacementMode
  readonly token: number | null
  readonly activeObjectId: string | null
  readonly sceneRevision: number
}

export class MoleculePlacementRequestGate {
  private latestReplaceToken = 0

  begin(
    state: PlacementState,
    mode: MoleculePlacementMode,
    sceneRevision: number,
  ): MoleculePlacementRequest {
    const activeObjectId = state.activeObjectId
    return {
      mode,
      token: mode === 'replace' ? ++this.latestReplaceToken : null,
      activeObjectId,
      sceneRevision,
    }
  }

  isLatest(request: MoleculePlacementRequest): boolean {
    return request.mode !== 'replace' || request.token === this.latestReplaceToken
  }

  canCommit(
    state: PlacementState,
    request: MoleculePlacementRequest,
    sceneRevision: number,
  ): boolean {
    if (request.mode !== 'replace') return true
    return this.isLatest(request)
      && sceneRevision === request.sceneRevision
      && state.activeObjectId === request.activeObjectId
  }
}
