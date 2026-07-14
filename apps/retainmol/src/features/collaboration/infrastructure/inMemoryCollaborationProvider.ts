import type {
  ApplyOperationResult,
  CollaborationEvent,
  CollaborationOperation,
  CollaborationProvider,
  CollaborationSnapshot,
  CollaborationSubscriber,
  CommittedCollaborationOperation,
  Presence,
  Unsubscribe,
} from '../domain/collaborationTypes'

interface DocumentState {
  revision: number
  readonly operationsById: Map<string, CommittedCollaborationOperation>
  readonly presenceByClientId: Map<string, Presence>
  readonly subscribers: Set<CollaborationSubscriber>
}

export class InMemoryCollaborationProvider implements CollaborationProvider {
  private readonly documents = new Map<string, DocumentState>()

  async submit(operation: CollaborationOperation): Promise<ApplyOperationResult> {
    assertOperation(operation)
    const state = this.getDocument(operation.documentId)
    const duplicate = state.operationsById.get(operation.operationId)
    if (duplicate) {
      return {
        status: 'duplicate',
        revision: duplicate.revision,
        operation: clone(duplicate),
      }
    }

    if (operation.baseRevision !== state.revision) {
      return {
        status: 'conflict',
        revision: state.revision,
        expectedRevision: state.revision,
      }
    }

    const committed = {
      ...clone(operation),
      revision: state.revision + 1,
    }
    state.revision = committed.revision
    state.operationsById.set(committed.operationId, committed)
    this.emit(state, {
      type: 'operation',
      documentId: operation.documentId,
      revision: committed.revision,
      operation: committed,
    })

    return {
      status: 'applied',
      revision: committed.revision,
      operation: clone(committed),
    }
  }

  async getSnapshot(documentId: string): Promise<CollaborationSnapshot> {
    assertIdentifier('documentId', documentId)
    const state = this.getDocument(documentId)
    return clone({
      documentId,
      revision: state.revision,
      operations: [...state.operationsById.values()],
      presence: [...state.presenceByClientId.values()],
    })
  }

  async setPresence(presence: Presence): Promise<void> {
    assertPresence(presence)
    const state = this.getDocument(presence.documentId)
    const change = state.presenceByClientId.has(presence.clientId) ? 'updated' : 'joined'
    const storedPresence = clone(presence)
    state.presenceByClientId.set(storedPresence.clientId, storedPresence)
    this.emit(state, {
      type: 'presence',
      documentId: presence.documentId,
      change,
      presence: storedPresence,
    })
  }

  async disconnect(documentId: string, clientId: string): Promise<void> {
    assertIdentifier('documentId', documentId)
    assertIdentifier('clientId', clientId)
    const state = this.getDocument(documentId)
    const presence = state.presenceByClientId.get(clientId)
    if (!presence) return

    state.presenceByClientId.delete(clientId)
    this.emit(state, {
      type: 'presence',
      documentId,
      change: 'left',
      presence,
    })
  }

  subscribe(documentId: string, subscriber: CollaborationSubscriber): Unsubscribe {
    assertIdentifier('documentId', documentId)
    const state = this.getDocument(documentId)
    state.subscribers.add(subscriber)
    return () => state.subscribers.delete(subscriber)
  }

  private getDocument(documentId: string): DocumentState {
    let state = this.documents.get(documentId)
    if (!state) {
      state = {
        revision: 0,
        operationsById: new Map(),
        presenceByClientId: new Map(),
        subscribers: new Set(),
      }
      this.documents.set(documentId, state)
    }
    return state
  }

  private emit(state: DocumentState, event: CollaborationEvent): void {
    for (const subscriber of [...state.subscribers]) {
      subscriber(clone(event))
    }
  }
}

function assertOperation(operation: CollaborationOperation): void {
  assertIdentifier('operation.operationId', operation.operationId)
  assertIdentifier('operation.documentId', operation.documentId)
  assertIdentifier('operation.actor', operation.actor)
  assertIdentifier('operation.plan.planId', operation.plan.planId)
  if (!Number.isSafeInteger(operation.baseRevision) || operation.baseRevision < 0) {
    throw new RangeError('operation.baseRevision must be a non-negative integer')
  }
}

function assertPresence(presence: Presence): void {
  assertIdentifier('presence.documentId', presence.documentId)
  assertIdentifier('presence.clientId', presence.clientId)
  assertIdentifier('presence.userId', presence.userId)
}

function assertIdentifier(name: string, value: string): void {
  if (!value.trim()) throw new Error(`${name} must be a non-empty string`)
}

function clone<T>(value: T): T {
  return structuredClone(value)
}
