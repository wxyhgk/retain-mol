import {
  type Action,
  type EditorDocumentChangeReason,
  KetcherLogger,
  type Render,
  Struct,
  Vec2,
  fromNewCanvas,
  fromPaste,
} from 'ketcher-core';

export interface IStructManager {
  clear(): void;
  renderAndRecoordinateStruct(
    struct: Struct,
    needToCenterStruct?: boolean,
    x?: number,
    y?: number,
  ): Struct;
  struct(
    value?: Struct,
    needToCenterStruct?: boolean,
    x?: number,
    y?: number,
  ): Struct;
  structToAddFragment(struct: Struct, x?: number, y?: number): Struct;
}

type Deps = {
  getRender: () => Render;
  getViewManager: () => {
    centerStruct(): void;
    positionStruct(x: number, y: number): void;
    centerViewportAccordingToStruct(s?: Struct): void;
    setRender(r: Render): void;
  };
  getSelectionManager: () => { selection(v?: unknown): unknown };
  getHoverIcon: () => { create(): void };
  update: (action: Action, isMonomerCreation?: boolean) => void;
  notifyDocumentChange?: (reason: EditorDocumentChangeReason) => void;
  isMonomerCreationWizardActive: () => boolean;
  shouldPreserveStructPosition: (
    opts: Record<string, unknown> | undefined,
    struct: Struct,
  ) => boolean;
  updateToolAfterOptionsChange: (wasViewOnly: boolean) => void;
};

export class StructManager implements IStructManager {
  constructor(private deps: Deps) {}

  clear() {
    this.struct(new Struct());
  }

  renderAndRecoordinateStruct(
    struct: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    const render = this.deps.getRender();
    const action = fromNewCanvas(render.ctab, struct);
    this.deps.update(action, this.deps.isMonomerCreationWizardActive());
    if (needToCenterStruct) {
      this.deps.getViewManager().centerStruct();
    } else if (x != null && y != null) {
      this.deps.getViewManager().positionStruct(x, y);
    }
    return render.ctab.molecule;
  }

  struct(
    value?: Struct,
    needToCenterStruct = true,
    x?: number,
    y?: number,
  ): Struct {
    const render = this.deps.getRender();
    if (arguments.length === 0) {
      return render.ctab.molecule;
    }
    KetcherLogger.log('Editor.struct(), start', value, needToCenterStruct);
    this.deps.getSelectionManager().selection(null);
    const struct = value ?? new Struct();
    const molecule = this.renderAndRecoordinateStruct(
      struct,
      needToCenterStruct,
      x,
      y,
    );
    this.deps.getHoverIcon().create();
    KetcherLogger.log('Editor.struct(), end');
    return molecule;
  }

  structToAddFragment(struct: Struct, x?: number, y?: number): Struct {
    const render = this.deps.getRender();
    if (x != null && y != null) {
      const position = new Vec2(x, y);
      const [action] = fromPaste(render.ctab, struct, position, 0, false, true);
      if (!action.isDummy(render.ctab)) {
        this.deps.notifyDocumentChange?.('untracked');
      }
      this.deps.update(action, true);
    } else {
      const superStruct = struct.mergeInto(render.ctab.molecule.clone());
      this.renderAndRecoordinateStruct(superStruct);
    }
    this.deps.getViewManager().centerViewportAccordingToStruct();
    return render.ctab.molecule;
  }
}
