import {
  type Action,
  Atom,
  Bond,
  type EditorDocumentChangeReason,
  fromBondAddition,
  KetcherLogger,
  MoleculeEditPlanExecutor,
  type MoleculeEditPlanV1,
  ReStruct,
  Render,
  type RenderOptions,
  Struct,
  Vec2,
} from 'ketcher-core';
import { createMoleculeCanvasReader } from 'molecule-ketcher';
import { HistoryManager } from './HistoryManager';
import { executeAtomHotspotCommand } from '../tool/atomHotspot';
import { attachTemplateToBond } from '../tool/templateAttachment';
import type { IToolContext } from '../tool/IToolContext';

function createFixture(failurePoint: 'listener' | 'render', withChain = false) {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  render.ctab = new ReStruct(new Struct(), render);
  const renderUpdate = jest
    .spyOn(render, 'update')
    .mockImplementation(() => undefined);
  let centerAtomId = 0;
  if (withChain) {
    const [, , centerId] = fromBondAddition(
      render.ctab,
      { type: 1 },
      { label: 'C' },
      { label: 'C' },
      new Vec2(-1, 0),
      new Vec2(0, 0),
    );
    centerAtomId = centerId;
    fromBondAddition(
      render.ctab,
      { type: 1 },
      centerId,
      { label: 'C' },
      undefined,
      new Vec2(1, 0),
    );
  }
  const listeners = new Set<(reason: EditorDocumentChangeReason) => void>();
  const notifyDocumentChange = (reason: EditorDocumentChangeReason) => {
    for (const listener of listeners) listener(reason);
  };
  const result = createMoleculeCanvasReader({
    getStruct: () => render.ctab.molecule,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
  if (!result.ok) throw new Error(result.error.message);
  const reader = result.value;
  const snapshot = () => {
    const document = reader.getDocument();
    if (!document.ok) throw new Error(document.error.message);
    return document.value;
  };
  const observed: Array<{ revision: number; atoms: number; bonds: number }> =
    [];
  reader.subscribe(() => {
    const document = snapshot();
    observed.push({
      revision: document.revision,
      atoms: document.atoms.length,
      bonds: document.bonds.length,
    });
  });
  const failure = new Error(
    `${failurePoint} failed after publishing the candidate`,
  );
  const editorChange = jest.fn();
  if (failurePoint === 'listener') {
    editorChange.mockImplementationOnce(() => {
      throw failure;
    });
  } else {
    renderUpdate.mockImplementationOnce(() => {
      throw failure;
    });
  }
  const history = new HistoryManager(
    {
      render,
      _tool: null,
      selection: jest.fn(),
      struct: () => render.ctab.molecule,
      findItem: () => null,
      event: {
        change: { dispatch: editorChange },
        showInfo: { dispatch: jest.fn() },
      },
    },
    {
      dispatchExternalChange: jest.fn(),
      shouldOmitActionOnHistoryReplay: () => false,
      notifyDocumentChange,
    },
  );
  const ctx = {
    render,
    update: (action: Action) => history.update(action),
    notifyDocumentChange,
    findMerge: () => ({
      atoms: new Map(),
      bonds: new Map(),
      atomToFunctionalGroup: new Map(),
    }),
    event: {},
  } as unknown as IToolContext;
  return { render, reader, snapshot, observed, ctx, failure, centerAtomId };
}

function oneAtomPlan(): MoleculeEditPlanV1 {
  return {
    schema: 'retainmol.molecule-edit-plan.v1',
    atomCount: 1,
    bondCount: 0,
    atoms: [{ ref: 'carbon', element: 'C', x: 0, y: 0 }],
    bonds: [],
    steps: [
      {
        id: 'first',
        label: 'Place carbon',
        commands: [
          {
            type: 'addAtom',
            atom: {
              ref: 'carbon',
              element: 'C',
              position: { x: 0, y: 0 },
            },
          },
        ],
      },
    ],
  };
}

function triangleTemplate() {
  const struct = new Struct();
  const first = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  const second = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));
  const third = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0.5, 0.87) }),
  );
  struct.bonds.add(new Bond({ begin: first, end: second, type: 1 }));
  struct.bonds.add(new Bond({ begin: second, end: third, type: 1 }));
  struct.bonds.add(new Bond({ begin: third, end: first, type: 1 }));
  struct.initHalfBonds();
  struct.initNeighbors();
  return struct;
}

describe('reader consistency after a published edit is rolled back', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(['listener', 'render'] as const)(
    'refreshes the reader after replay rolls back a %s failure',
    (failurePoint) => {
      const { ctx, render, reader, snapshot, observed, failure } =
        createFixture(failurePoint);
      const before = snapshot();
      const executor = new MoleculeEditPlanExecutor(ctx, oneAtomPlan());

      expect(() => executor.applyNextStep()).toThrow(failure);

      const after = snapshot();
      expect(render.ctab.molecule.atoms.size).toBe(0);
      expect(after.atoms).toEqual(before.atoms);
      expect(after.bonds).toEqual(before.bonds);
      expect(observed.map(({ atoms, bonds }) => [atoms, bonds])).toEqual([
        [1, 0],
        [0, 0],
      ]);
      expect(after.revision).toBeGreaterThan(observed[0].revision);
      expect(executor.nextStepIndex).toBe(0);
      expect(executor.atomIds.size).toBe(0);
      reader.dispose();
    },
  );

  it.each(['listener', 'render'] as const)(
    'refreshes the reader after gem-dimethyl rolls back a %s failure',
    (failurePoint) => {
      const { ctx, render, reader, snapshot, observed, failure, centerAtomId } =
        createFixture(failurePoint, true);
      const before = snapshot();

      expect(() =>
        executeAtomHotspotCommand(ctx, centerAtomId, {
          command: 'gem-dimethyl',
        }),
      ).toThrow(failure);

      const after = snapshot();
      expect(render.ctab.molecule.atoms.size).toBe(3);
      expect(render.ctab.molecule.bonds.size).toBe(2);
      expect(after.atoms).toEqual(before.atoms);
      expect(after.bonds).toEqual(before.bonds);
      expect(observed.map(({ atoms, bonds }) => [atoms, bonds])).toEqual([
        [5, 4],
        [3, 2],
      ]);
      expect(after.revision).toBeGreaterThan(observed[0].revision);
      reader.dispose();
    },
  );

  it.each(['listener', 'render'] as const)(
    'refreshes the reader after bond-template attachment rolls back a %s failure',
    async (failurePoint) => {
      jest.spyOn(KetcherLogger, 'error').mockImplementation(() => undefined);
      const { ctx, render, reader, snapshot, observed } = createFixture(
        failurePoint,
        true,
      );
      const before = snapshot();

      expect(
        await attachTemplateToBond(
          ctx,
          { struct: triangleTemplate(), aid: 0, bid: 0 },
          0,
        ),
      ).toBe(false);

      const after = snapshot();
      expect(render.ctab.molecule.atoms.size).toBe(3);
      expect(render.ctab.molecule.bonds.size).toBe(2);
      expect(after.atoms).toEqual(before.atoms);
      expect(after.bonds).toEqual(before.bonds);
      expect(observed).toHaveLength(2);
      expect(observed[0].atoms).toBeGreaterThan(3);
      expect(after.revision).toBeGreaterThan(observed[0].revision);
      reader.dispose();
    },
  );
});
