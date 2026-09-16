/****************************************************************************
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { ReStruct } from '../../render';
import type { BaseOperation } from '../operations/BaseOperation';
import { Action } from './action';

type TransactionState = 'active' | 'committed' | 'rolled-back';

type CapturedStep = {
  rollback(): void;
};

export class ActionTransaction {
  readonly #restruct: ReStruct;
  readonly #steps: CapturedStep[] = [];
  readonly #inverseAction = new Action();
  #state: TransactionState = 'active';

  constructor(restruct: ReStruct) {
    this.#restruct = restruct;
  }

  capture(action: Action): Action;
  capture<TOperation extends BaseOperation>(
    inverseOperation: TOperation,
  ): TOperation;

  capture(inverse: Action | BaseOperation): Action | BaseOperation {
    this.assertActive('capture');

    if (inverse instanceof Action) {
      // Existing eager builders often keep merging into the same Action after
      // it has been captured. Snapshot its operations so the transaction's
      // rollback chronology cannot be changed by a later merge or reverse.
      const capturedAction = new Action([...inverse.operations]);
      this.#steps.push({
        rollback: () => {
          capturedAction.perform(this.#restruct);
        },
      });
      this.#inverseAction.mergeWith(capturedAction);
    } else {
      this.#steps.push({
        rollback: () => {
          inverse.perform(this.#restruct);
        },
      });
      this.#inverseAction.addOp(inverse);
    }

    return inverse;
  }

  commit(): Action {
    if (this.#state === 'rolled-back') {
      throw new Error('Cannot commit a rolled-back action transaction');
    }
    this.#state = 'committed';
    return this.#inverseAction;
  }

  rollback(): void;
  rollback(cause: unknown): never;
  rollback(cause?: unknown): void {
    const hasCause = arguments.length > 0;
    if (this.#state === 'committed') {
      throw new Error('Cannot roll back a committed action transaction');
    }
    if (this.#state === 'rolled-back') {
      if (hasCause) throw cause;
      return;
    }

    this.#state = 'rolled-back';
    const rollbackErrors: unknown[] = [];

    for (const step of [...this.#steps].reverse()) {
      try {
        step.rollback();
      } catch (rollbackCause) {
        rollbackErrors.push(rollbackCause);
      }
    }

    if (rollbackErrors.length > 0) {
      const errors = hasCause ? [cause, ...rollbackErrors] : rollbackErrors;
      throw new AggregateError(
        errors,
        hasCause
          ? 'Action transaction failed and could not be rolled back completely'
          : 'Action transaction could not be rolled back completely',
        hasCause ? { cause } : undefined,
      );
    }

    if (hasCause) throw cause;
  }

  private assertActive(operation: string): void {
    if (this.#state !== 'active') {
      throw new Error(`Cannot ${operation} an action transaction after commit`);
    }
  }
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

export function runActionTransaction(
  restruct: ReStruct,
  callback: (transaction: ActionTransaction) => unknown,
): Action {
  const transaction = new ActionTransaction(restruct);

  try {
    const result = callback(transaction);
    if (isPromiseLike(result)) {
      throw new TypeError(
        'runActionTransaction only accepts a synchronous callback; use ActionTransaction directly for async work',
      );
    }
    return transaction.commit();
  } catch (cause) {
    transaction.rollback(cause);
    throw cause;
  }
}
