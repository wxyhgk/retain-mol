export interface UndoTransactionHandle {
  readonly owner: string
  readonly active: boolean
  commit(): void
  cancel(): void
}
