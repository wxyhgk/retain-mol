import {
  ActionTransaction,
  runActionTransaction,
} from 'application/editor/actions/actionTransaction';
import { Action } from 'application/editor/actions/action';
import type { BaseOperation } from 'application/editor/operations/BaseOperation';
import type { ReStruct } from 'application/render';

const createOperation = (
  perform: (restruct: ReStruct) => BaseOperation,
): BaseOperation =>
  ({
    priority: 0,
    perform,
    isDummy: () => false,
  } as unknown as BaseOperation);

describe('ActionTransaction', () => {
  const restruct = {} as ReStruct;

  it('commits inverses captured from successfully executed operations', () => {
    const events: string[] = [];
    const inverseFirst = createOperation(() => {
      events.push('undo-first');
      return createOperation(() => inverseFirst);
    });
    const inverseSecond = createOperation(() => {
      events.push('undo-second');
      return createOperation(() => inverseSecond);
    });
    const first = createOperation(() => {
      events.push('first');
      return inverseFirst;
    });
    const second = createOperation(() => {
      events.push('second');
      return inverseSecond;
    });

    const action = runActionTransaction(restruct, (transaction) => {
      transaction.capture(first.perform(restruct));
      transaction.capture(second.perform(restruct));
    });

    expect(events).toEqual(['first', 'second']);
    expect(action.operations).toEqual([inverseFirst, inverseSecond]);
  });

  it('rolls back completed operations in reverse order and preserves the original error', () => {
    const events: string[] = [];
    const failure = new Error('second operation failed');
    const inverseFirst = createOperation(() => {
      events.push('rollback-first');
      return createOperation(() => inverseFirst);
    });
    const first = createOperation(() => {
      events.push('first');
      return inverseFirst;
    });
    const second = createOperation(() => {
      events.push('second');
      throw failure;
    });

    let thrown: unknown;
    try {
      runActionTransaction(restruct, (transaction) => {
        transaction.capture(first.perform(restruct));
        transaction.capture(second.perform(restruct));
      });
    } catch (cause) {
      thrown = cause;
    }

    expect(thrown).toBe(failure);
    expect(events).toEqual(['first', 'second', 'rollback-first']);
  });

  it('captures an eager Action as one rollback step', () => {
    const events: string[] = [];
    const actionInverse = createOperation(() => {
      events.push('rollback-action');
      return createOperation(() => actionInverse);
    });
    const eagerAction = new Action([actionInverse]);
    const inverseOperation = createOperation(() => {
      events.push('rollback-operation');
      return createOperation(() => inverseOperation);
    });
    const failure = new Error('later step failed');
    const transaction = new ActionTransaction(restruct);

    transaction.capture(eagerAction);
    transaction.capture(inverseOperation);

    expect(() => transaction.rollback(failure)).toThrow(failure);
    expect(events).toEqual(['rollback-operation', 'rollback-action']);
  });

  it('snapshots a captured Action before later merges mutate it', () => {
    const events: string[] = [];
    const capturedInverse = createOperation(() => {
      events.push('captured');
      return createOperation(() => capturedInverse);
    });
    const laterInverse = createOperation(() => {
      events.push('later');
      return createOperation(() => laterInverse);
    });
    const eagerAction = new Action([capturedInverse]);
    const transaction = new ActionTransaction(restruct);

    transaction.capture(eagerAction);
    eagerAction.mergeWith(new Action([laterInverse]));
    transaction.rollback();

    expect(events).toEqual(['captured']);
  });

  it('reports the original and rollback errors together', () => {
    const failure = new Error('transaction failed');
    const rollbackFailure = new Error('rollback failed');
    const inverse = createOperation(() => {
      throw rollbackFailure;
    });
    const transaction = new ActionTransaction(restruct);
    transaction.capture(inverse);

    let thrown: unknown;
    try {
      transaction.rollback(failure);
    } catch (cause) {
      thrown = cause;
    }

    expect(thrown).toBeInstanceOf(AggregateError);
    expect((thrown as AggregateError).errors).toEqual([
      failure,
      rollbackFailure,
    ]);
    expect((thrown as AggregateError).cause).toBe(failure);
  });
});
