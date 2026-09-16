import {
  Action,
  Atom,
  type EditorDocumentChangeReason,
  Pile,
  type Render,
  Struct,
  Vec2,
} from 'ketcher-core';
import { MonomerWizardManager } from './MonomerWizardManager';

function createFixture() {
  const original = new Struct();
  original.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  original.atoms.add(new Atom({ label: 'N', pp: new Vec2(1, 0) }));
  const render = {
    ctab: { molecule: original },
    monomerCreationState: null,
  } as unknown as Render;
  const originalHistory = [new Action()];
  let history = originalHistory;
  let historyPointer = 1;
  let transitioning = false;
  const notifyDocumentChange = jest.fn<void, [EditorDocumentChangeReason]>();
  const setStruct = jest.fn((struct: Struct) => {
    render.ctab.molecule = struct;
  });
  const manager = new MonomerWizardManager({
    getRender: () => render,
    getStruct: () => render.ctab.molecule,
    update: jest.fn(),
    setStruct,
    getSelection: () => ({ atoms: [0], bonds: [] }),
    structSelected: (selection) =>
      render.ctab.molecule.clone(
        new Pile(selection.atoms),
        new Pile(selection.bonds),
      ),
    getHistoryStack: () => history,
    setHistoryStack: (value) => {
      history = value;
    },
    getHistoryPtr: () => historyPointer,
    setHistoryPtr: (value) => {
      historyPointer = value;
    },
    subscribeToChangeEventInMonomerCreationWizard: jest.fn(),
    unsubscribeFromChangeEventInMonomerCreationWizard: jest.fn(),
    setMonomerCreationStateNull: () => {
      render.monomerCreationState = null;
    },
    toolSelect: jest.fn(),
    notifyDocumentChange,
    setDocumentTransitioning: (active) => {
      transitioning = active;
    },
  });
  return {
    manager,
    render,
    original,
    originalHistory,
    notifyDocumentChange,
    setStruct,
    getHistory: () => ({ history, historyPointer }),
    isTransitioning: () => transitioning,
  };
}

describe('monomer wizard document availability', () => {
  it('marks the document unavailable before installing the temporary selection', () => {
    const { manager, render, original, notifyDocumentChange, setStruct } =
      createFixture();
    const observed: unknown[] = [];
    notifyDocumentChange.mockImplementation((reason) => {
      observed.push([
        reason,
        manager.isMonomerCreationWizardActive,
        render.ctab.molecule,
      ]);
    });

    manager.openMonomerCreationWizard();

    expect(observed).toEqual([['mode', true, original]]);
    expect(render.ctab.molecule).not.toBe(original);
    expect(render.ctab.molecule.atoms.size).toBe(1);
    expect(notifyDocumentChange.mock.invocationCallOrder[0]).toBeLessThan(
      setStruct.mock.invocationCallOrder[0],
    );
  });

  it('restores the original document and history before announcing availability', () => {
    const {
      manager,
      render,
      original,
      originalHistory,
      notifyDocumentChange,
      getHistory,
    } = createFixture();
    manager.openMonomerCreationWizard();
    notifyDocumentChange.mockClear();
    const observed: unknown[] = [];
    notifyDocumentChange.mockImplementation((reason) => {
      observed.push([
        reason,
        manager.isMonomerCreationWizardActive,
        render.ctab.molecule,
        getHistory(),
      ]);
    });

    manager.closeMonomerCreationWizard(true);
    manager.closeMonomerCreationWizard(true);

    expect(observed).toEqual([
      [
        'mode',
        false,
        original,
        { history: originalHistory, historyPointer: 1 },
      ],
    ]);
  });

  it('does not announce availability when restoring the original structure fails', () => {
    const { manager, notifyDocumentChange, setStruct } = createFixture();
    manager.openMonomerCreationWizard();
    notifyDocumentChange.mockClear();
    setStruct.mockImplementation(() => {
      throw new Error('restore failed');
    });

    expect(() => manager.closeMonomerCreationWizard(true)).toThrow(
      'restore failed',
    );
    expect(manager.isMonomerCreationWizardActive).toBe(true);
    expect(notifyDocumentChange).not.toHaveBeenCalled();
  });

  it('keeps a non-restoring close unavailable after clearing the wizard state', () => {
    const { manager, render, notifyDocumentChange, isTransitioning } =
      createFixture();
    manager.openMonomerCreationWizard();
    const wizardStruct = render.ctab.molecule;
    notifyDocumentChange.mockClear();
    const observed: unknown[] = [];
    notifyDocumentChange.mockImplementation((reason) => {
      observed.push([
        reason,
        manager.isMonomerCreationWizardActive,
        isTransitioning(),
      ]);
    });

    manager.closeMonomerCreationWizard();

    expect(render.ctab.molecule).toBe(wizardStruct);
    expect(observed).toEqual([['mode', false, true]]);
  });
});
