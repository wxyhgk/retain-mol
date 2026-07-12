import type { EditCommandResult } from '../commands/shared'

export type EditSelectionPolicy = 'clear' | 'preserve'
export type EditUndoPolicy = 'record' | 'inherit'

export interface EditUseCaseOptions {
  readonly owner: string
  readonly selectionPolicy?: EditSelectionPolicy
  readonly undoPolicy?: EditUndoPolicy
}

export interface EditUseCaseExecutorDependencies {
  readonly commitMolecule: (
    molecule: Extract<EditCommandResult, { ok: true; changed: true }>['molecule'],
    selectionPolicy: EditSelectionPolicy,
  ) => void
  readonly flashHint: (message: string) => void
  readonly runTransaction: <T>(owner: string, operation: () => T) => T
}

export interface EditUseCaseExecutor {
  execute(result: EditCommandResult, options: EditUseCaseOptions): EditCommandResult
}

/**
 * The only application-level gateway from a pure edit result into runtime state.
 * Domain commands never decide selection, undo, dirty flags, or user messaging.
 */
export function createEditUseCaseExecutor(
  dependencies: EditUseCaseExecutorDependencies,
): EditUseCaseExecutor {
  return {
    execute(result, options) {
      if (result.ok === false) {
        dependencies.flashHint(result.reason)
        return result
      }

      const commit = () => {
        if (result.changed) {
          dependencies.commitMolecule(
            result.molecule,
            options.selectionPolicy ?? 'clear',
          )
        }
        if (result.message) dependencies.flashHint(result.message)
      }

      if (options.undoPolicy === 'inherit') commit()
      else dependencies.runTransaction(options.owner, commit)
      return result
    },
  }
}
