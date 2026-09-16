import { Action } from 'application/editor/actions/action';
import type { BaseOperation } from 'application/editor/operations/BaseOperation';
import type { ReStruct } from 'application/render';

const createOperation = (
  priority: number,
  perform: (restruct: ReStruct) => BaseOperation,
): BaseOperation =>
  ({
    priority,
    perform,
    isDummy: () => false,
  } as unknown as BaseOperation);

describe('Action.perform()', () => {
  const restruct = {} as ReStruct;

  it('rolls back completed operations in reverse order when a later one fails', () => {
    const events: string[] = [];
    const ignoredInverse = {} as BaseOperation;
    const rollbackFirst = createOperation(0, () => {
      events.push('rollback-first');
      return ignoredInverse;
    });
    const rollbackSecond = createOperation(0, () => {
      events.push('rollback-second');
      return ignoredInverse;
    });
    const firstOperation = createOperation(1, () => {
      events.push('first');
      return rollbackFirst;
    });
    const secondOperation = createOperation(2, () => {
      events.push('second');
      return rollbackSecond;
    });
    const failingOperation = createOperation(3, () => {
      events.push('failure');
      throw new Error('operation failed');
    });

    const action = new Action([
      firstOperation,
      secondOperation,
      failingOperation,
    ]);

    expect(() => action.perform(restruct)).toThrow('operation failed');
    expect(events).toEqual([
      'first',
      'second',
      'failure',
      'rollback-second',
      'rollback-first',
    ]);
  });

  it('reports both the original and rollback errors when recovery fails', () => {
    const rollback = createOperation(0, () => {
      throw new Error('rollback failed');
    });
    const successfulOperation = createOperation(1, () => rollback);
    const failingOperation = createOperation(2, () => {
      throw new Error('operation failed');
    });

    expect(() =>
      new Action([successfulOperation, failingOperation]).perform(restruct),
    ).toThrow('Action failed and could not be rolled back completely');
  });
});
