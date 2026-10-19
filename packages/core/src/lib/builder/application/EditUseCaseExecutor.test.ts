import { describe, expect, it, vi } from 'vitest'
import { editChanged, editFailed } from '../commands/shared'
import { createEditUseCaseExecutor } from './EditUseCaseExecutor'

describe('EditUseCaseExecutor', () => {
  it('owns transaction, selection policy, and message delivery', () => {
    const commitMolecule = vi.fn()
    const flashHint = vi.fn()
    const transactionOwners: string[] = []
    const runTransaction = <T>(owner: string, operation: () => T): T => {
      transactionOwners.push(owner)
      return operation()
    }
    const executor = createEditUseCaseExecutor({ commitMolecule, flashHint, runTransaction })
    const molecule = { name: 'changed', atoms: [], bonds: [] }

    executor.execute(editChanged(molecule, 'done'), {
      owner: 'builder:atom-click',
      selectionPolicy: 'preserve',
    })

    expect(transactionOwners).toEqual(['builder:atom-click'])
    expect(commitMolecule).toHaveBeenCalledWith(molecule, 'preserve')
    expect(flashHint).toHaveBeenCalledWith('done')
  })

  it('does not open a transaction for a failed result', () => {
    const transactionOwners: string[] = []
    const runTransaction = <T>(owner: string, operation: () => T): T => {
      transactionOwners.push(owner)
      return operation()
    }
    const flashHint = vi.fn()
    const executor = createEditUseCaseExecutor({
      commitMolecule: vi.fn(),
      flashHint,
      runTransaction,
    })

    executor.execute(editFailed('invalid'), { owner: 'builder:bond' })

    expect(flashHint).toHaveBeenCalledWith('invalid')
    expect(transactionOwners).toEqual([])
  })
})
