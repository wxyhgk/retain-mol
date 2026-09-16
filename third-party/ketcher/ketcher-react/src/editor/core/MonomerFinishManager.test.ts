import {
  type EditorDocumentChangeReason,
  fromAtomAddition,
  fromAtomsAttrs,
  fromNewCanvas,
  Pile,
  ReStruct,
  Render,
  type RenderOptions,
  Struct,
  Vec2,
} from 'ketcher-core';
import { MonomerFinishManager } from './MonomerFinishManager';
import type { ISGroupManager } from './SGroupManager';

function createFixture() {
  const render = new Render(
    document as unknown as HTMLElement,
    {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions,
  );
  render.ctab = new ReStruct(new Struct(), render);
  jest.spyOn(render, 'update').mockImplementation(() => {
    // Preserve graph preparation performed by rendering, without drawing SVG.
    render.ctab.assignConnectedComponents();
  });
  fromAtomAddition(render.ctab, new Vec2(0, 0), { label: 'C' });
  fromAtomAddition(render.ctab, new Vec2(1, 0), { label: 'N' });
  const original = render.ctab.molecule;
  const wizard = original.clone(new Pile([0]), new Pile([]));
  fromNewCanvas(render.ctab, wizard);
  fromAtomsAttrs(render.ctab, [0], { label: 'O' }, false);
  render.monomerCreationState = {
    assignedAttachmentPoints: new Map(),
    potentialAttachmentPoints: new Map(),
    problematicAttachmentPoints: new Set(),
    hasDefaultAttachmentPoints: false,
  };
  let transitioning = false;
  const readableSnapshots: string[][] = [];
  const notifyDocumentChange = jest.fn<void, [EditorDocumentChangeReason]>(
    () => {
      if (!transitioning && !render.monomerCreationState) {
        readableSnapshots.push(
          Array.from(
            render.ctab.molecule.atoms.values(),
            (atom) => atom.label,
          ).sort(),
        );
      }
    },
  );
  const closeMonomerCreationWizard = jest.fn(() => {
    expect(transitioning).toBe(true);
    render.monomerCreationState = null;
    notifyDocumentChange('mode');
  });
  const setStruct = jest.fn((struct: Struct) => {
    fromNewCanvas(render.ctab, struct);
    notifyDocumentChange('replace');
    return render.ctab.molecule;
  });
  const updateMonomersLibrary = jest.fn();
  const manager = new MonomerFinishManager({
    getRender: () => render,
    getStruct: () => render.ctab.molecule,
    setStruct,
    update: jest.fn(),
    closeMonomerCreationWizard,
    getMonomerCreationState: () => render.monomerCreationState,
    getOriginalStruct: () => original,
    getOriginalSelection: () => ({ atoms: [0], bonds: [] }),
    getSelectedToOriginalAtomsIdMap: () => new Map([[0, 0]]),
    updateMonomersLibrary,
    selection: () => null,
    dispatchChange: jest.fn(),
    getSGroupManager: () =>
      ({
        getOriginalSelectedMonomerExpanded: () => true,
      } as unknown as ISGroupManager),
    setDocumentTransitioning: (active) => {
      transitioning = active;
    },
    notifyDocumentChange,
  });
  return {
    manager,
    render,
    readableSnapshots,
    notifyDocumentChange,
    closeMonomerCreationWizard,
    setStruct,
    updateMonomersLibrary,
    isTransitioning: () => transitioning,
  };
}

describe('monomer completion document transition', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('keeps the wizard and asynchronous merge unavailable until the final structure is installed', () => {
    const {
      manager,
      render,
      readableSnapshots,
      closeMonomerCreationWizard,
      isTransitioning,
    } = createFixture();

    manager.finishNewMonomersCreation([]);

    expect(closeMonomerCreationWizard).toHaveBeenCalledTimes(1);
    expect(render.monomerCreationState).toBeNull();
    expect(isTransitioning()).toBe(true);
    expect(readableSnapshots).toEqual([]);

    jest.runAllTimers();

    expect(isTransitioning()).toBe(false);
    expect(readableSnapshots).toEqual([['N', 'O']]);
  });

  it('remains unavailable after a synchronous completion failure', () => {
    const {
      manager,
      updateMonomersLibrary,
      readableSnapshots,
      isTransitioning,
    } = createFixture();
    updateMonomersLibrary.mockImplementation(() => {
      throw new Error('library failed');
    });

    expect(() => manager.finishNewMonomersCreation([])).toThrow(
      'library failed',
    );
    expect(isTransitioning()).toBe(true);
    expect(readableSnapshots).toEqual([]);
  });

  it('remains unavailable when the asynchronous final structure installation fails', () => {
    const { manager, setStruct, readableSnapshots, isTransitioning } =
      createFixture();
    setStruct.mockImplementation(() => {
      throw new Error('final install failed');
    });
    manager.finishNewMonomersCreation([]);

    expect(() => jest.runAllTimers()).toThrow('final install failed');
    expect(isTransitioning()).toBe(true);
    expect(readableSnapshots).toEqual([]);
  });
});
