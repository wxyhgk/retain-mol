import type {
  ExpectedEffectComparison,
  ExpectedEffectCompileResult,
  ExpectedEffectMismatch,
  ModelingEffectReceipt,
} from './contracts'

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function countIds(ids: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>()
  ids.forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1))
  return counts
}

function mismatch(
  mismatches: ExpectedEffectMismatch[],
  code: ExpectedEffectMismatch['code'],
  message: string,
  commandIndex?: number,
  commandId?: string,
): void {
  mismatches.push({
    code,
    message,
    ...(commandIndex === undefined ? {} : { commandIndex }),
    ...(commandId === undefined ? {} : { commandId }),
  })
}

/** Strictly compare a builder-produced per-command receipt with the independent expectation. */
export function compareExpectedEffect(
  expected: ExpectedEffectCompileResult,
  actual: ModelingEffectReceipt,
): ExpectedEffectComparison {
  if (expected.status === 'indeterminate') {
    return {
      verdict: 'indeterminate',
      reason: expected.reason,
      message: expected.message,
      mismatches: [],
    }
  }

  const mismatches: ExpectedEffectMismatch[] = []
  if (expected.schemaVersion !== actual.schemaVersion) {
    mismatch(
      mismatches,
      'schema-version-mismatch',
      `Expected receipt schema ${expected.schemaVersion}, received ${actual.schemaVersion}`,
    )
  }
  if (expected.planId !== actual.planId) {
    mismatch(mismatches, 'plan-id-mismatch', `Expected plan ${expected.planId}, received ${actual.planId}`)
  }
  if (expected.baseDigest !== actual.baseDigest) {
    mismatch(mismatches, 'base-digest-mismatch', 'Receipt base digest does not match the compiled expectation')
  }

  const expectedIds = expected.commands.map(command => command.commandId)
  const actualIds = actual.commands.map(command => command.commandId)
  const expectedIdCounts = countIds(expectedIds)
  const actualIdCounts = countIds(actualIds)
  expectedIdCounts.forEach((expectedCount, commandId) => {
    const missingCount = expectedCount - (actualIdCounts.get(commandId) ?? 0)
    for (let occurrence = 0; occurrence < missingCount; occurrence += 1) {
      mismatch(
        mismatches,
        'missing-command-receipt',
        `Missing receipt for command ${commandId}`,
        expectedIds.indexOf(commandId),
        commandId,
      )
    }
  })
  actualIdCounts.forEach((actualCount, commandId) => {
    const extraCount = actualCount - (expectedIdCounts.get(commandId) ?? 0)
    for (let occurrence = 0; occurrence < extraCount; occurrence += 1) {
      mismatch(
        mismatches,
        'extra-command-receipt',
        `Unexpected receipt for command ${commandId}`,
        actualIds.lastIndexOf(commandId),
        commandId,
      )
    }
  })
  const hasSameCommandMultiset = expectedIdCounts.size === actualIdCounts.size
    && [...expectedIdCounts].every(([id, count]) => actualIdCounts.get(id) === count)
  if (
    hasSameCommandMultiset
    && !sameValue(expectedIds, actualIds)
  ) {
    mismatch(mismatches, 'command-order-mismatch', 'Command receipts are not in plan order')
  }

  if (sameValue(expectedIds, actualIds)) {
    expected.commands.forEach((expectedCommand, commandIndex) => {
      const actualCommand = actual.commands[commandIndex]!
      const commandId = expectedCommand.commandId
      if (expectedCommand.kind !== actualCommand.kind) {
        mismatch(mismatches, 'command-kind-mismatch', `Wrong kind for command ${commandId}`, commandIndex, commandId)
      }
      if (expectedCommand.preDigest !== actualCommand.preDigest) {
        mismatch(mismatches, 'pre-digest-mismatch', `Wrong pre digest for command ${commandId}`, commandIndex, commandId)
      }
      if (expectedCommand.postDigest !== actualCommand.postDigest) {
        mismatch(mismatches, 'post-digest-mismatch', `Wrong post digest for command ${commandId}`, commandIndex, commandId)
      }
      if (!sameValue(expectedCommand.changes.atoms, actualCommand.changes.atoms)) {
        mismatch(mismatches, 'atom-changes-mismatch', `Wrong atom changes for command ${commandId}`, commandIndex, commandId)
      }
      if (!sameValue(expectedCommand.changes.bonds, actualCommand.changes.bonds)) {
        mismatch(mismatches, 'bond-changes-mismatch', `Wrong bond changes for command ${commandId}`, commandIndex, commandId)
      }
    })
  }

  if (expected.finalDigest !== actual.finalDigest) {
    mismatch(mismatches, 'final-digest-mismatch', 'Receipt final digest does not match the compiled expectation')
  }

  return mismatches.length === 0
    ? { verdict: 'pass', mismatches: [] }
    : { verdict: 'reject', mismatches }
}
