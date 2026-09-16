import {
  Action,
  fromItemsFuse,
  fromTemplateOnBondAction,
  getItemsToFuse,
  KetcherLogger,
} from 'ketcher-core';
import type { IToolContext } from './IToolContext';
import { attachTemplateToBond } from './templateAttachment';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  fromItemsFuse: jest.fn(),
  fromTemplateOnBondAction: jest.fn(),
  getItemsToFuse: jest.fn(),
}));

const mockFromItemsFuse = jest.mocked(fromItemsFuse);
const mockFromTemplateOnBondAction = jest.mocked(fromTemplateOnBondAction);
const mockGetItemsToFuse = jest.mocked(getItemsToFuse);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}

function createTemplate(bondIds = [0]) {
  return {
    atoms: new Map([
      [0, {}],
      [1, {}],
    ]),
    bonds: new Map(bondIds.map((id) => [id, { begin: 0, end: 1 }])),
    sgroups: new Map(),
  };
}

function createContext(targetBondIds = [0, 1]) {
  const update = jest.fn();
  const errorHandler = jest.fn();
  const findMerge = jest.fn(() => ({
    atoms: new Map<number, number>(),
    bonds: new Map<number, number>(),
    atomToFunctionalGroup: new Map<number, number>(),
  }));
  const restruct = {
    bonds: new Map(targetBondIds.map((id) => [id, { b: { id } }])),
    molecule: {},
  };
  const ctx = {
    render: { ctab: restruct },
    event: {},
    update,
    errorHandler,
    findMerge,
  } as unknown as IToolContext;
  return { ctx, restruct, update, errorHandler, findMerge };
}

describe('attachTemplateToBond', () => {
  const coreOperation = {
    priority: 0,
    perform: jest.fn(function () {
      return this;
    }),
    isDummy: () => false,
  };
  const fuseOperation = {
    priority: 0,
    perform: jest.fn(function () {
      return this;
    }),
    isDummy: () => false,
  };
  const coreAction = new Action([coreOperation as never]);
  const pasteItems = { atoms: [2], bonds: [2] };
  const mergeItems = {
    atoms: new Map<number, number>(),
    bonds: new Map<number, number>(),
    atomToFunctionalGroup: new Map<number, number>(),
  };
  const fuseAction = new Action([fuseOperation as never]);
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerSpy = jest
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => undefined);
    coreOperation.perform.mockClear();
    fuseOperation.perform.mockClear();
    mockGetItemsToFuse.mockReturnValue(mergeItems);
    mockFromItemsFuse.mockReturnValue(fuseAction as never);
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  it.each([0, 1])(
    'waits for core attachment before updating target bond %i',
    async (targetBondId) => {
      const pending = deferred<[typeof coreAction, typeof pasteItems]>();
      mockFromTemplateOnBondAction.mockReturnValueOnce(
        pending.promise as never,
      );
      const { ctx, restruct, update, findMerge } = createContext();

      const result = attachTemplateToBond(
        ctx,
        { struct: createTemplate() as never },
        targetBondId,
        false,
      );

      expect(update).not.toHaveBeenCalled();
      expect(mockFromTemplateOnBondAction).toHaveBeenCalledWith(
        restruct,
        expect.objectContaining({ bid: 0 }),
        targetBondId,
        ctx.event,
        false,
        true,
      );

      pending.resolve([coreAction, pasteItems]);

      await expect(result).resolves.toBe(true);
      expect(findMerge).toHaveBeenCalledWith(pasteItems, ['atoms', 'bonds']);
      expect(mockGetItemsToFuse).toHaveBeenCalledWith(
        restruct.molecule,
        findMerge.mock.results[0].value,
      );
      expect(mockFromItemsFuse).toHaveBeenCalledWith(restruct, mergeItems);
      expect(update).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith(expect.any(Action));
      expect(update.mock.calls[0][0].operations).toEqual([
        fuseOperation,
        coreOperation,
      ]);
    },
  );

  it('honors an existing attachment bond id', async () => {
    mockFromTemplateOnBondAction.mockResolvedValueOnce([
      coreAction,
      pasteItems,
    ] as never);
    const { ctx } = createContext();

    await attachTemplateToBond(
      ctx,
      { struct: createTemplate([0, 7]) as never, bid: '7' },
      1,
      false,
    );

    expect(mockFromTemplateOnBondAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ bid: 7 }),
      1,
      expect.anything(),
      false,
      true,
    );
  });

  it('falls back to attachment bond 0 when the requested id is invalid', async () => {
    mockFromTemplateOnBondAction.mockResolvedValueOnce([
      coreAction,
      pasteItems,
    ] as never);
    const { ctx } = createContext();

    await attachTemplateToBond(
      ctx,
      { struct: createTemplate() as never, bid: 9 },
      1,
      false,
    );

    expect(mockFromTemplateOnBondAction).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ bid: 0 }),
      1,
      expect.anything(),
      false,
      true,
    );
  });

  it.each([
    ['a rejected core action', () => Promise.reject(new Error('rejected'))],
    [
      'a synchronous core failure',
      () => {
        throw new Error('synchronous');
      },
    ],
  ])('reports %s without updating', async (_name, fail) => {
    mockFromTemplateOnBondAction.mockImplementationOnce(fail as never);
    const { ctx, update, errorHandler } = createContext();

    await expect(
      attachTemplateToBond(
        ctx,
        { struct: createTemplate() as never },
        0,
        false,
      ),
    ).resolves.toBe(false);

    expect(update).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });

  it('rejects missing target and template bonds before invoking core', async () => {
    const missingTarget = createContext([]);
    await expect(
      attachTemplateToBond(
        missingTarget.ctx,
        { struct: createTemplate() as never },
        0,
      ),
    ).resolves.toBe(false);

    const missingTemplateBond = createContext();
    await expect(
      attachTemplateToBond(
        missingTemplateBond.ctx,
        { struct: createTemplate([]) as never },
        0,
      ),
    ).resolves.toBe(false);

    expect(mockFromTemplateOnBondAction).not.toHaveBeenCalled();
    expect(missingTarget.update).not.toHaveBeenCalled();
    expect(missingTemplateBond.update).not.toHaveBeenCalled();
  });

  it('rolls back a completed core attachment when fusion preparation fails', async () => {
    const rollback = jest.fn();
    const rollbackOperation = {
      priority: 0,
      perform: rollback.mockImplementation(function () {
        return coreOperation;
      }),
      isDummy: () => false,
    };
    mockFromTemplateOnBondAction.mockResolvedValueOnce([
      new Action([rollbackOperation as never]),
      pasteItems,
    ] as never);
    mockGetItemsToFuse.mockImplementationOnce(() => {
      throw new Error('fusion failed');
    });
    const { ctx, restruct, update } = createContext();

    await expect(
      attachTemplateToBond(
        ctx,
        { struct: createTemplate() as never },
        0,
        false,
      ),
    ).resolves.toBe(false);

    expect(rollback).toHaveBeenCalledWith(restruct);
    expect(update).not.toHaveBeenCalled();
  });
});
