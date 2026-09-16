import {
  KetcherLogger,
  OperationType,
  type Action,
  type EditorDocumentChangeReason,
  type Render,
} from 'ketcher-core';
import { isEqual } from 'lodash/fp';
import {
  setFunctionalGroupsTooltip,
  type FunctionalGroupsTooltipContext,
} from '../utils/functionalGroupsTooltip';
import type { Tool } from '../tool/Tool';
import { MoleculeStructSwapAction } from './MoleculeStructSwapAction';
import { runMoleculeListener } from './moleculeListeners';
const HISTORY_SIZE = 32;

interface HistoryManagerContext extends FunctionalGroupsTooltipContext {
  render: Render;
  _tool: Tool | null;
  selection(value: null): unknown;
  event: FunctionalGroupsTooltipContext['event'] & {
    change: { dispatch(action?: Action): unknown };
  };
}

export interface HistoryManagerDependencies {
  dispatchExternalChange(action?: Action): unknown;
  shouldOmitActionOnHistoryReplay(tool: Tool | null): boolean;
  notifyDocumentChange?(reason: EditorDocumentChangeReason): void;
  publishMoleculeReplay?(): void;
}

export interface IHistoryManager {
  historyStack: Action[];
  historyPtr: number;
  readonly origin: Action | null;
  isDitrty(): boolean;
  isDirty(): boolean;
  setOrigin(): void;
  historySize(): { readonly undo: number; readonly redo: number };
  update(action: Action | true, ignoreHistory?: boolean): void;
  recordCommittedAction(action: Action): void;
  undo(): void;
  redo(): void;
  clearHistory(): void;
}
export class HistoryManager implements IHistoryManager {
  static readonly MAX_SIZE = HISTORY_SIZE;
  #origin: Action | null = null;
  #stack: Action[] = [];
  #ptr = 0;
  private readonly editor: HistoryManagerContext;
  private readonly dependencies: HistoryManagerDependencies;

  constructor(
    editor: HistoryManagerContext,
    dependencies: HistoryManagerDependencies,
  ) {
    this.editor = editor;
    this.dependencies = dependencies;
  }

  get historyStack(): Action[] {
    return this.#stack;
  }

  set historyStack(value: Action[]) {
    this.#stack = value;
  }

  get historyPtr(): number {
    return this.#ptr;
  }

  set historyPtr(value: number) {
    this.#ptr = value;
  }

  get origin(): Action | null {
    return this.#origin;
  }

  isDitrty(): boolean {
    const p = this.#ptr;
    const l = this.#stack.length;
    if (!l || !this.#origin) return false;
    return !isEqual(this.#stack[p - 1], this.#origin);
  }

  isDirty(): boolean {
    return this.isDitrty();
  }

  setOrigin(): void {
    this.#origin = this.#ptr ? this.#stack[this.#ptr - 1] : null;
  }

  historySize(): { readonly undo: number; readonly redo: number } {
    return { undo: this.#ptr, redo: this.#stack.length - this.#ptr };
  }

  recordCommittedAction(action: Action): void {
    this.#stack.splice(this.#ptr, HISTORY_SIZE + 1, action);
    if (this.#stack.length > HISTORY_SIZE) this.#stack.shift();
    this.#ptr = this.#stack.length;
  }

  update(action: Action | true, ignoreHistory?: boolean): void {
    setFunctionalGroupsTooltip({
      editor: this.editor,
      isShow: false,
    });
    if (!ignoreHistory)
      this.editor.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    if (action === true) {
      this.editor.render.update(true, null);
      return;
    }
    if (!ignoreHistory && !action.isDummy(this.editor.render.ctab)) {
      this.#stack.splice(this.#ptr, HISTORY_SIZE + 1, action);
      if (this.#stack.length > HISTORY_SIZE) this.#stack.shift();
      this.#ptr = this.#stack.length;
      this.dependencies.notifyDocumentChange?.(
        action.operations.some(
          (operation) => operation.type === OperationType.CANVAS_LOAD,
        )
          ? 'replace'
          : 'edit',
      );
      this.editor.event.change.dispatch(action);
      this.dependencies.dispatchExternalChange(action);
    }
    this.editor.render.update(false, null);
  }

  undo(): void {
    KetcherLogger.log('Editor.undo(), start, ', this.#ptr, this.#stack);
    if (this.#ptr === 0) throw new Error('Undo stack is empty');
    if (this.editor._tool?.cancel) this.editor._tool.cancel();
    if (this.#stack[this.#ptr - 1] instanceof MoleculeStructSwapAction) {
      const nextPointer = this.#ptr - 1;
      const action = this.#stack[nextPointer].perform(this.editor.render.ctab);
      this.#stack[nextPointer] = action;
      this.#ptr = nextPointer;
      runMoleculeListener(() =>
        this.dependencies.notifyDocumentChange?.('undo'),
      );
      runMoleculeListener(() => this.dependencies.publishMoleculeReplay?.());
      return;
    }
    this.editor.selection(null);
    const nextPointer = this.#ptr - 1;
    const stack = this.#stack[nextPointer];
    const action = stack.perform(this.editor.render.ctab);
    this.#stack[nextPointer] = action;
    this.#ptr = nextPointer;
    this.dependencies.notifyDocumentChange?.('undo');
    if (this.dependencies.shouldOmitActionOnHistoryReplay(this.editor._tool)) {
      this.editor.event.change.dispatch();
      this.dependencies.dispatchExternalChange();
    } else {
      this.editor.event.change.dispatch(action);
      this.dependencies.dispatchExternalChange(action);
    }
    this.editor.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    this.editor.render.update();
    KetcherLogger.log('Editor.undo(), end');
  }

  redo(): void {
    KetcherLogger.log('Editor.redo(), start, ', this.#ptr, this.#stack);
    if (this.#ptr === this.#stack.length)
      throw new Error('Redo stack is empty');
    if (this.editor._tool?.cancel) this.editor._tool.cancel();
    if (this.#stack[this.#ptr] instanceof MoleculeStructSwapAction) {
      const action = this.#stack[this.#ptr].perform(this.editor.render.ctab);
      this.#stack[this.#ptr] = action;
      this.#ptr++;
      runMoleculeListener(() =>
        this.dependencies.notifyDocumentChange?.('redo'),
      );
      runMoleculeListener(() => this.dependencies.publishMoleculeReplay?.());
      return;
    }
    this.editor.selection(null);
    const stack = this.#stack[this.#ptr];
    const action = stack.perform(this.editor.render.ctab);
    this.#stack[this.#ptr] = action;
    this.#ptr++;
    this.dependencies.notifyDocumentChange?.('redo');
    if (this.dependencies.shouldOmitActionOnHistoryReplay(this.editor._tool)) {
      this.editor.event.change.dispatch();
      this.dependencies.dispatchExternalChange();
    } else {
      this.editor.event.change.dispatch(action);
      this.dependencies.dispatchExternalChange(action);
    }
    this.editor.render.ctab.needRecalculateVisibleAtomsAndBonds = true;
    this.editor.render.update();
    KetcherLogger.log('Editor.redo(), end');
  }

  clearHistory(): void {
    this.#stack = [];
    this.#ptr = 0;
  }
}
