import type { StoreApi } from 'zustand'

export interface SelectorSubscribe<T> {
  subscribe: {
    (listener: (state: T, previousState: T) => void): () => void
    <U>(
      selector: (state: T) => U,
      listener: (selected: U, previous: U) => void,
      options?: {
        equalityFn?: (left: U, right: U) => boolean
        fireImmediately?: boolean
      },
    ): () => void
  }
}

export type SelectorStoreApi<T> = StoreApi<T> & SelectorSubscribe<T>
