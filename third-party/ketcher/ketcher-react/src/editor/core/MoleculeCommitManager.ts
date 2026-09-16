import {
  type MoleculeCanvasCommitResult,
  ReStruct,
  type Render,
  type Struct,
  Vec2,
  type ViewBox,
} from 'ketcher-core';
import type { IHistoryManager } from './HistoryManager';
import type { ISelectionManager, Selection } from './SelectionManager';
import { MoleculeStructSwapAction } from './MoleculeStructSwapAction';
import { runMoleculeListener } from './moleculeListeners';

interface Snapshot {
  struct: Struct;
  selection: Selection | null;
  viewBox: ViewBox;
  offset: Vec2;
  zoom: number;
}

interface Dependencies {
  getRender(): Render;
  getSelection(): ISelectionManager;
  getHistory(): IHistoryManager;
  getBusyReason(): string | null;
  publish(): void;
}

export class MoleculeCommitManager {
  isCommitting = false;
  unavailableReason: string | null = null;

  constructor(private readonly deps: Dependencies) {}

  private capture(): Snapshot {
    const render = this.deps.getRender();
    const selected = this.deps.getSelection().selection();
    return {
      struct: render.ctab.molecule,
      selection: selected
        ? Object.fromEntries(
            Object.entries(selected).map(([key, ids]) => [key, [...ids]]),
          )
        : null,
      viewBox: { ...render.viewBox },
      offset: new Vec2(render.options.offset),
      zoom: render.options.zoom,
    };
  }

  private install(snapshot: Snapshot): void {
    const render = this.deps.getRender();
    render.ctab.dispose();
    render.ctab = new ReStruct(snapshot.struct, render);
    render.options.offset = new Vec2(snapshot.offset);
    render.options.zoom = snapshot.zoom;
    render.viewBox = { ...snapshot.viewBox };
    this.deps.getSelection().replaceSilently(snapshot.selection);
    render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    render.update(true);
    render.setViewBox({ ...snapshot.viewBox });
  }

  private swap(target: Snapshot): MoleculeStructSwapAction {
    if (this.deps.getRender().options.downScale)
      throw new Error('Molecule edits do not support automatic downscaling.');
    const wasCommitting = this.isCommitting;
    this.isCommitting = true;
    const previous = this.capture();
    try {
      this.install(target);
    } catch (error) {
      try {
        this.install(previous);
      } catch (rollbackError) {
        this.unavailableReason =
          'The molecule renderer could not be restored after a failed edit.';
        throw new AggregateError(
          [error, rollbackError],
          this.unavailableReason,
        );
      }
      throw error;
    } finally {
      this.isCommitting = wasCommitting;
    }
    return new MoleculeStructSwapAction(() => {
      const currentView = this.capture();
      return this.swap({
        ...previous,
        viewBox: currentView.viewBox,
        offset: currentView.offset,
        zoom: currentView.zoom,
      });
    });
  }

  commit(
    candidate: Struct,
    expected: Struct,
    onCommitted: () => void,
  ): MoleculeCanvasCommitResult {
    const busy = this.deps.getBusyReason();
    if (this.deps.getRender().options.downScale)
      return {
        ok: false,
        reason: 'busy',
        message: 'Molecule edits do not support automatic downscaling.',
      };
    if (busy || this.isCommitting)
      return {
        ok: false,
        reason: 'busy',
        message: busy ?? 'A molecule edit is in progress.',
      };
    if (this.unavailableReason)
      return { ok: false, reason: 'rollback', message: this.unavailableReason };
    if (this.deps.getRender().ctab.molecule !== expected)
      return {
        ok: false,
        reason: 'changed',
        message: 'The canvas changed before the edit could be installed.',
      };
    this.isCommitting = true;
    try {
      const previous = this.capture();
      let undo: MoleculeStructSwapAction;
      try {
        undo = this.swap({ ...previous, struct: candidate });
      } catch (error) {
        return {
          ok: false,
          reason: this.unavailableReason ? 'rollback' : 'render',
          message: error instanceof Error ? error.message : String(error),
        };
      }
      const history = this.deps.getHistory();
      const historyEntries = [...history.historyStack];
      const historyPointer = history.historyPtr;
      try {
        history.recordCommittedAction(undo);
      } catch (error) {
        history.historyStack = historyEntries;
        history.historyPtr = historyPointer;
        try {
          this.install(previous);
        } catch {
          this.unavailableReason =
            'The molecule renderer could not be restored after a failed edit.';
        }
        return {
          ok: false,
          reason: this.unavailableReason ? 'rollback' : 'render',
          message:
            this.unavailableReason ??
            (error instanceof Error ? error.message : String(error)),
        };
      }
      runMoleculeListener(onCommitted);
      runMoleculeListener(() => this.deps.publish());
      return { ok: true };
    } finally {
      this.isCommitting = false;
    }
  }
}
