import type { IToolContext } from './IToolContext';

interface ToolEventHandler {
  click?(event: Event): void;

  dblclick?(event: Event): void;

  mousedown?(event: Event): void;

  mousemove?(event: Event): void;

  mouseup?(event: Event): void;

  mouseleave?(event: Event): void;

  mouseLeaveClientArea?(event: Event): void;

  mouseover?(event: Event): void;
}

export type HoverTarget =
  | { id: number; map: string }
  | { id: string; map: 'merge'; items: Record<string, number[]> };

export interface Tool extends ToolEventHandler {
  cancel?(): void;

  isSelectionRunning?(): boolean;
  isMoleculeEditIdle?(): boolean;

  isNotActiveTool?: boolean;

  ci?: HoverTarget;
}

export type ToolConstructorInterface = new (
  editor: IToolContext,
  ...args: unknown[]
) => Tool;

export type ToolEventHandlerName = keyof ToolEventHandler;
