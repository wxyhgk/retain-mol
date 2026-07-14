import type { EditPlan } from '@retainmol/mol-viewer/modeling'

export interface CollaborationOperation {
  readonly operationId: string
  readonly documentId: string
  readonly actor: string
  readonly baseRevision: number
  readonly plan: EditPlan
  readonly createdAt: string
}

export interface CommittedCollaborationOperation extends CollaborationOperation {
  readonly revision: number
}

export interface Presence {
  readonly documentId: string
  readonly clientId: string
  readonly userId: string
  readonly displayName?: string
  readonly color?: string
  readonly selection?: {
    readonly atomIds: readonly string[]
    readonly bondIds: readonly string[]
  }
  readonly cursor?: {
    readonly x: number
    readonly y: number
    readonly z?: number
  }
  readonly camera?: {
    readonly position: readonly [number, number, number]
    readonly target: readonly [number, number, number]
    readonly up?: readonly [number, number, number]
  }
  readonly updatedAt: string
}

export interface CollaborationSnapshot {
  readonly documentId: string
  readonly revision: number
  readonly operations: readonly CommittedCollaborationOperation[]
  readonly presence: readonly Presence[]
}

export type CollaborationEvent =
  | {
      readonly type: 'operation'
      readonly documentId: string
      readonly revision: number
      readonly operation: CommittedCollaborationOperation
    }
  | {
      readonly type: 'presence'
      readonly documentId: string
      readonly change: 'joined' | 'updated' | 'left'
      readonly presence: Presence
    }

export type ApplyOperationResult =
  | {
      readonly status: 'applied'
      readonly revision: number
      readonly operation: CommittedCollaborationOperation
    }
  | {
      readonly status: 'duplicate'
      readonly revision: number
      readonly operation: CommittedCollaborationOperation
    }
  | {
      readonly status: 'conflict'
      readonly revision: number
      readonly expectedRevision: number
    }

export type CollaborationSubscriber = (event: CollaborationEvent) => void
export type Unsubscribe = () => void

export interface CollaborationProvider {
  submit(operation: CollaborationOperation): Promise<ApplyOperationResult>
  getSnapshot(documentId: string): Promise<CollaborationSnapshot>
  setPresence(presence: Presence): Promise<void>
  disconnect(documentId: string, clientId: string): Promise<void>
  subscribe(documentId: string, subscriber: CollaborationSubscriber): Unsubscribe
}
