import { Action, fromTemplateOnBondAction, KetcherLogger } from 'ketcher-core';
import type { IToolContext } from './IToolContext';
import TemplatePreview from './templatePreview';

jest.mock('ketcher-core', () => ({
  ...jest.requireActual('ketcher-core'),
  fromTemplateOnBondAction: jest.fn(),
}));

jest.mock('./template.helpers', () => ({
  ...jest.requireActual('./template.helpers'),
  getBondFlipSign: jest.fn(() => 1),
}));

const mockFromTemplateOnBondAction = jest.mocked(fromTemplateOnBondAction);

function deferred<T>() {
  let resolveDeferred!: (value: T) => void;
  let rejectDeferred!: (cause: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    resolveDeferred = resolve;
    rejectDeferred = reject;
  });
  return {
    promise,
    reject: rejectDeferred,
    resolve: resolveDeferred,
  };
}

function createFixture() {
  const restruct = {
    molecule: {
      atoms: new Map(),
      bonds: new Map([[1, { begin: 0, end: 1, isPreview: false }]]),
    },
  };
  const update = jest.fn();
  const editor = {
    event: {},
    findMerge: jest.fn(() => ({
      atoms: new Map(),
      bonds: new Map(),
      atomToFunctionalGroup: new Map(),
    })),
    render: { ctab: restruct, update: jest.fn() },
    update,
  } as unknown as IToolContext;
  const preview = new TemplatePreview(
    editor,
    { aid: 0, bid: 0, molecule: undefined, sign: 1 },
    null,
  );
  const showConnectedPreview = preview as unknown as {
    showConnectedPreview(
      event: MouseEvent,
      item: { map: string; id: number; dist: number },
    ): void;
  };

  return { editor, preview, restruct, showConnectedPreview, update };
}

describe('TemplatePreview async transaction', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rolls back a stale bond preview that resolves after hide', async () => {
    const pending = deferred<[Action, { atoms: number[]; bonds: number[] }]>();
    mockFromTemplateOnBondAction.mockReturnValueOnce(pending.promise as never);
    const ignoredInverse = {
      isDummy: () => false,
      perform: jest.fn(),
      priority: 0,
    };
    const rollbackOperation = {
      isDummy: () => false,
      perform: jest.fn(() => ignoredInverse),
      priority: 0,
    };
    const templateAction = new Action([rollbackOperation as never]);
    const { preview, restruct, showConnectedPreview, update } = createFixture();

    showConnectedPreview.showConnectedPreview({} as MouseEvent, {
      map: 'bonds',
      id: 1,
      dist: 0,
    });
    preview.hideConnectedPreview();
    pending.resolve([templateAction, { atoms: [], bonds: [] }]);
    await pending.promise;
    await Promise.resolve();

    expect(rollbackOperation.perform).toHaveBeenCalledWith(restruct);
    expect(update).not.toHaveBeenCalled();
  });

  it('consumes and logs a rejected bond preview Promise', async () => {
    const pending = deferred<[Action, { atoms: number[]; bonds: number[] }]>();
    mockFromTemplateOnBondAction.mockReturnValueOnce(pending.promise as never);
    const logger = jest
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => undefined);
    const { showConnectedPreview, update } = createFixture();

    showConnectedPreview.showConnectedPreview({} as MouseEvent, {
      map: 'bonds',
      id: 1,
      dist: 0,
    });
    pending.reject(new Error('preview failed'));
    await expect(pending.promise).rejects.toThrow('preview failed');
    await Promise.resolve();

    expect(logger).toHaveBeenCalledWith(
      'templatePreview.ts::showConnectedPreview',
      expect.objectContaining({ message: 'preview failed' }),
    );
    expect(update).not.toHaveBeenCalled();
  });
});
