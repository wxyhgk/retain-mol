import { DOMSubscription } from 'subscription';
import type { ToolEventHandlerName } from '../tool/Tool';
export interface IEditorEventBus {
  readonly clientArea: HTMLElement;
  readonly isMoleculeEditBusy: boolean;
  on(
    handlerName: ToolEventHandlerName | string,
    handler: (e: Event) => boolean | void,
    priority?: number,
  ): void;
  off(
    handlerName: ToolEventHandlerName | string,
    handler: (e: Event) => boolean | void,
  ): void;
  destroy(): void;
  getSubscription(handlerName: string): DOMSubscription | undefined;
}
type Tracked = {
  target: EventTarget;
  eventName: string;
  toolEventHandler: ToolEventHandlerName;
};
export class EditorEventBus implements IEditorEventBus {
  private dispatchDepth = 0;
  private primaryPointerDown = false;
  private subs = new Map<string, DOMSubscription>();
  private listeners: Array<{
    target: EventTarget;
    eventName: string;
    listener: EventListener;
    capture?: boolean;
  }> = [];

  constructor(readonly clientArea: HTMLElement) {
    this.setup();
  }

  get isMoleculeEditBusy(): boolean {
    return this.dispatchDepth > 0 || this.primaryPointerDown;
  }

  private setup() {
    const pointerDown = (event: Event) => {
      if ((event as PointerEvent).button === 0) this.primaryPointerDown = true;
    };
    const releasePointer = () => {
      this.primaryPointerDown = false;
    };
    this.clientArea.addEventListener('pointerdown', pointerDown, true);
    document.addEventListener('pointercancel', releasePointer);
    window.addEventListener('blur', releasePointer);
    this.listeners.push(
      {
        target: this.clientArea,
        eventName: 'pointerdown',
        listener: pointerDown,
        capture: true,
      },
      {
        target: document,
        eventName: 'pointercancel',
        listener: releasePointer,
      },
      { target: window, eventName: 'blur', listener: releasePointer },
    );
    const tracked: Tracked[] = [
      {
        target: this.clientArea,
        eventName: 'click',
        toolEventHandler: 'click',
      },
      {
        target: this.clientArea,
        eventName: 'dblclick',
        toolEventHandler: 'dblclick',
      },
      {
        target: this.clientArea,
        eventName: 'mousedown',
        toolEventHandler: 'mousedown',
      },
      {
        target: document,
        eventName: 'mousemove',
        toolEventHandler: 'mousemove',
      },
      { target: document, eventName: 'mouseup', toolEventHandler: 'mouseup' },
      {
        target: document,
        eventName: 'mouseleave',
        toolEventHandler: 'mouseleave',
      },
      {
        target: this.clientArea,
        eventName: 'mouseleave',
        toolEventHandler: 'mouseLeaveClientArea',
      },
      {
        target: this.clientArea,
        eventName: 'mouseover',
        toolEventHandler: 'mouseover',
      },
    ];
    tracked.forEach(({ target, eventName, toolEventHandler }) => {
      let s = this.subs.get(toolEventHandler);
      if (!s) {
        s = new DOMSubscription();
        const dispatch = s.dispatch.bind(s);
        s.dispatch = (event: Event) => {
          if (
            toolEventHandler === 'mousedown' &&
            (event as MouseEvent).button === 0
          )
            this.primaryPointerDown = true;
          this.dispatchDepth++;
          try {
            return dispatch(event);
          } finally {
            this.dispatchDepth--;
            if (
              toolEventHandler === 'mouseup' &&
              (event as MouseEvent).button === 0
            )
              this.primaryPointerDown = false;
          }
        };
        this.subs.set(toolEventHandler, s);
      }
      const listener = (event: Event) => {
        if (
          (window as unknown as { isPolymerEditorTurnedOn?: boolean })
            .isPolymerEditorTurnedOn
        ) {
          if (toolEventHandler === 'mouseup') this.primaryPointerDown = false;
          return;
        }
        (s as DOMSubscription).dispatch(event);
      };
      target.addEventListener(eventName, listener as EventListener);
      this.listeners.push({
        target,
        eventName,
        listener: listener as EventListener,
      });
    });
  }

  on(
    handlerName: string,
    handler: (e: Event) => boolean | void,
    priority?: number,
  ): void {
    this.subs.get(handlerName)?.add(handler as (e: Event) => boolean, priority);
  }

  off(handlerName: string, handler: (e: Event) => boolean | void): void {
    this.subs.get(handlerName)?.remove(handler as (e: Event) => boolean);
  }

  destroy(): void {
    this.listeners.forEach(({ target, eventName, listener, capture }) =>
      target.removeEventListener(eventName, listener, capture),
    );
    this.listeners = [];
    this.subs.clear();
    this.primaryPointerDown = false;
  }

  getSubscription(handlerName: string): DOMSubscription | undefined {
    return this.subs.get(handlerName);
  }
}
