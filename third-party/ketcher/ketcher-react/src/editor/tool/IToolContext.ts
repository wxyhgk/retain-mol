import type {
  Action,
  EditMonomerVariant,
  EditorDocumentChangeReason,
  MonomerCreationInitialValues,
  MonomerCreationState,
  Render,
  RenderOptions,
  SGroupAttachmentPoint,
  Struct,
} from 'ketcher-core';
import type { Selection } from '../core/SelectionManager';
import type {
  ClosestItemWithMap,
  MergeResult,
  SelectedItems,
  SkipItem,
} from '../shared/closest.types';
import type { HoverTarget, Tool } from './Tool';

/**
 * Minimal context exposed to tools. Facade over `Editor` to break direct
 * `import Editor` coupling. Tools should depend only on this interface.
 * Editor structurally implements it, so `new Tool(this)` remains valid.
 *
 * Facade mapping (Editor → IToolContext):
 *  view      → render / viewManager
 *  selection → selection / explicitSelected / selectionManager
 *  history   → update / historyManager
 *  struct    → struct / structSelected / structManager
 *  bus       → event / eventBus
 */
export interface IToolContext {
  // core state
  render: Render;
  monomerCreationState: MonomerCreationState | null;
  ketcherId?: string;
  errorHandler?: ((message: string) => void) | null;

  // selection / struct  (selection & struct facades)
  selection(
    selection?: Selection | 'all' | 'descriptors' | null,
  ): Selection | null;
  struct(value?: Struct): Struct;
  explicitSelected(autoSelectBonds?: boolean): Selection;
  structSelected?(
    existingSelection?: Selection,
    atomIdMap?: Map<number, number>,
    bondIdMap?: Map<number, number>,
  ): Struct;
  findItem(
    event: Event | MouseEvent | { clientX: number; clientY: number },
    maps: Array<string> | null,
    skip?: SkipItem | null,
  ): (ClosestItemWithMap & HoverTarget) | null;
  findMerge(srcItems: SelectedItems, maps?: string[]): MergeResult;
  hover(ci: HoverTarget | null, tool?: Tool | null, event?: PointerEvent): void;
  update(action: Action | true, ignoreHistory?: boolean): void;
  notifyDocumentChange?(reason: EditorDocumentChangeReason): void;

  // UI controllers & events (bus facade)
  rotateController: {
    isRotating?: boolean;
    revert?(): void;
    rerender(): void;
    clean(): void;
  };
  event: {
    message: {
      dispatch(payload?: { info?: string | false; error?: string }): void;
    };
    tooltip: { dispatch(payload?: { message: string }): void };
    enhancedStereoEdit: {
      dispatch(payload: {
        stereoLabel?: string | null;
      }): Promise<string | null | undefined>;
    };
    elementEdit: {
      dispatch(payload?: unknown): Promise<Record<string, unknown>>;
    };
    sgroupEdit: {
      dispatch(payload?: unknown): Promise<{
        type?: string;
        attrs: {
          context?: string;
          expanded?: boolean;
          [key: string]: unknown;
        };
      }>;
    };
    editMonomer: {
      dispatch(payload: {
        fgIds: number[];
        variant: EditMonomerVariant;
      }): void | Promise<unknown>;
    };
    removeFG: {
      dispatch(payload: { fgIds: number[] }): void | Promise<unknown>;
    };
    [key: string]: {
      dispatch(payload?: unknown): void | Promise<unknown>;
    };
  };

  // navigation
  tool(name?: string, opts?: unknown): Tool | null;
  openMonomerCreationWizard(
    selectionOverride?: Selection,
    editInstanceInitialValues?: MonomerCreationInitialValues,
    editInstanceAttachmentPoints?: ReadonlyArray<SGroupAttachmentPoint>,
  ): void;

  // options / misc used by helpers
  options(value?: Record<string, unknown>): RenderOptions;
}
