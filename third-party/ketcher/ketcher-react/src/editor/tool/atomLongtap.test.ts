import {
  Action,
  fromBondAddition,
  KetcherLogger,
  ReStruct,
  Render,
  type RenderOptions,
  Struct,
  Vec2,
} from 'ketcher-core';
import { atomLongtapEvent } from './atom';

function createContext(atomId: number | null) {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  const ctab = new ReStruct(new Struct(), render);
  if (atomId !== null) {
    fromBondAddition(
      ctab,
      { type: 1 },
      { label: 'C' },
      { label: 'C' },
      new Vec2(0, 0),
      new Vec2(1, 0),
    );
  }
  const quickEdit = jest.fn().mockResolvedValue({ label: 'O' });
  const update = jest.fn<void, [Action]>();
  const editor = {
    selection: jest.fn(),
    event: { quickEdit: { dispatch: quickEdit } },
    update,
  };
  const dragCtx: {
    item: { id: number; map: 'atoms' } | null;
    xy0: Vec2;
    stopTapping?: () => void;
  } = {
    item: atomId === null ? null : { id: atomId, map: 'atoms' },
    xy0: new Vec2(2, 3),
  };
  const tool = { dragCtx, editor };

  return { tool, dragCtx, ctab, quickEdit, update };
}

describe('atom long tap real editor actions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it.each([0, 1])(
    'edits existing atom %i without adding an atom and supports undo/redo',
    async (atomId) => {
      const { tool, ctab, quickEdit, update } = createContext(atomId);
      const originalAtom = ctab.molecule.atoms.get(atomId);

      atomLongtapEvent(tool, { ctab });
      await jest.advanceTimersByTimeAsync(749);
      expect(quickEdit).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(1);

      expect(quickEdit).toHaveBeenCalledWith(originalAtom);
      expect(ctab.molecule.atoms.size).toBe(2);
      expect(ctab.molecule.bonds.size).toBe(1);
      expect(ctab.molecule.atoms.get(atomId)?.label).toBe('O');
      expect(ctab.molecule.atoms.get(1 - atomId)?.label).toBe('C');
      expect(update).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledWith(expect.any(Action));

      const undo = update.mock.calls[0][0];
      const redo = undo.perform(ctab);
      expect(ctab.molecule.atoms.get(atomId)?.label).toBe('C');
      expect(ctab.molecule.atoms.size).toBe(2);
      expect(ctab.molecule.bonds.size).toBe(1);

      redo.perform(ctab);
      expect(ctab.molecule.atoms.get(atomId)?.label).toBe('O');
      expect(ctab.molecule.atoms.size).toBe(2);
      expect(ctab.molecule.bonds.size).toBe(1);
    },
  );

  it('adds an atom at the press position on an empty canvas', async () => {
    const { tool, dragCtx, ctab, quickEdit, update } = createContext(null);

    atomLongtapEvent(tool, { ctab });
    await jest.advanceTimersByTimeAsync(750);

    expect(quickEdit).toHaveBeenCalledWith(
      expect.objectContaining({ label: '' }),
    );
    expect(ctab.molecule.atoms.size).toBe(1);
    expect(ctab.molecule.atoms.get(0)).toEqual(
      expect.objectContaining({ label: 'O', pp: dragCtx.xy0 }),
    );
    expect(ctab.molecule.bonds.size).toBe(0);
    expect(update).toHaveBeenCalledTimes(1);

    update.mock.calls[0][0].perform(ctab);
    expect(ctab.molecule.atoms.size).toBe(0);
  });

  it.each([0, null])(
    'does not modify the canvas or update history when editing target %s is cancelled',
    async (atomId) => {
      const { tool, ctab, quickEdit, update } = createContext(atomId);
      const initialAtoms = ctab.molecule.atoms.size;
      const initialBonds = ctab.molecule.bonds.size;
      const initialLabels = Array.from(
        ctab.molecule.atoms.values(),
        (atom) => atom.label,
      );
      quickEdit.mockRejectedValueOnce('Cancel');
      jest.spyOn(KetcherLogger, 'error').mockImplementation(() => undefined);

      atomLongtapEvent(tool, { ctab });
      await jest.advanceTimersByTimeAsync(750);

      expect(quickEdit).toHaveBeenCalledTimes(1);
      expect(update).not.toHaveBeenCalled();
      expect(ctab.molecule.atoms.size).toBe(initialAtoms);
      expect(ctab.molecule.bonds.size).toBe(initialBonds);
      expect(
        Array.from(ctab.molecule.atoms.values(), (atom) => atom.label),
      ).toEqual(initialLabels);
    },
  );

  it('does not open quick edit when the long tap is stopped early', async () => {
    const { tool, dragCtx, ctab, quickEdit, update } = createContext(0);

    atomLongtapEvent(tool, { ctab });
    await jest.advanceTimersByTimeAsync(749);
    dragCtx.stopTapping?.();
    await jest.advanceTimersByTimeAsync(1);

    expect(quickEdit).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(ctab.molecule.atoms.get(0)?.label).toBe('C');
    expect(ctab.molecule.atoms.size).toBe(2);
  });
});
