import { describe, expect, it } from 'vitest'

import type {
  CollaborationEvent,
  CollaborationOperation,
  Presence,
} from '../domain/collaborationTypes'
import { InMemoryCollaborationProvider } from './inMemoryCollaborationProvider'

const documentId = 'molecule-1'

function operation(overrides: Partial<CollaborationOperation> = {}): CollaborationOperation {
  return {
    operationId: 'operation-1',
    documentId,
    actor: 'client-a',
    baseRevision: 0,
    plan: {
      schemaVersion: 1,
      planId: 'plan-1',
      source: 'system',
      targetObjectId: 'object-1',
      commands: [],
    },
    createdAt: '2026-07-14T00:00:00.000Z',
    ...overrides,
  }
}

function presence(overrides: Partial<Presence> = {}): Presence {
  return {
    documentId,
    clientId: 'client-a',
    userId: 'user-a',
    displayName: 'Ada',
    selection: { atomIds: ['atom-1'], bondIds: [] },
    cursor: { x: 12, y: 24 },
    camera: { position: [0, 0, 10], target: [0, 0, 0] },
    updatedAt: '2026-07-14T00:00:00.000Z',
    ...overrides,
  }
}

describe('InMemoryCollaborationProvider', () => {
  it('commits an operation, advances revision, and notifies subscribers', async () => {
    const provider = new InMemoryCollaborationProvider()
    const events: CollaborationEvent[] = []
    provider.subscribe(documentId, (event) => events.push(event))

    const result = await provider.submit(operation())

    expect(result).toMatchObject({ status: 'applied', revision: 1 })
    expect(events).toEqual([
      {
        type: 'operation',
        documentId,
        revision: 1,
        operation: { ...operation(), revision: 1 },
      },
    ])
    await expect(provider.getSnapshot(documentId)).resolves.toMatchObject({
      revision: 1,
      operations: [{ ...operation(), revision: 1 }],
    })
  })

  it('rejects stale revisions without emitting an operation', async () => {
    const provider = new InMemoryCollaborationProvider()
    const events: CollaborationEvent[] = []
    provider.subscribe(documentId, (event) => events.push(event))
    await provider.submit(operation())

    const result = await provider.submit(operation({ operationId: 'operation-2', baseRevision: 0 }))

    expect(result).toEqual({ status: 'conflict', revision: 1, expectedRevision: 1 })
    expect(events).toHaveLength(1)
  })

  it('treats a retried operation id as idempotent', async () => {
    const provider = new InMemoryCollaborationProvider()
    const first = await provider.submit(operation())

    const retry = await provider.submit(operation({
      baseRevision: 1,
      plan: { ...operation().plan, planId: 'ignored-retry-plan' },
    }))

    expect(first).toMatchObject({ status: 'applied', revision: 1 })
    expect(retry).toMatchObject({ status: 'duplicate', revision: 1 })
    await expect(provider.getSnapshot(documentId)).resolves.toMatchObject({
      revision: 1,
      operations: [{ ...operation(), revision: 1 }],
    })
  })

  it('publishes presence changes, supports unsubscribe, and disconnects idempotently', async () => {
    const provider = new InMemoryCollaborationProvider()
    const events: CollaborationEvent[] = []
    const unsubscribe = provider.subscribe(documentId, (event) => events.push(event))

    await provider.setPresence(presence())
    await provider.setPresence(presence({ displayName: 'Ada Lovelace' }))
    await provider.disconnect(documentId, 'client-a')
    await provider.disconnect(documentId, 'client-a')
    unsubscribe()
    await provider.setPresence(presence({ clientId: 'client-b', userId: 'user-b' }))

    expect(events.map((event) => event.type === 'presence' && event.change)).toEqual([
      'joined',
      'updated',
      'left',
    ])
    await expect(provider.getSnapshot(documentId)).resolves.toMatchObject({
      presence: [presence({ clientId: 'client-b', userId: 'user-b' })],
    })
  })
})
