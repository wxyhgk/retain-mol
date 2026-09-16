import { DOMSubscription } from 'subscription';
import type { ToolEventHandlerName } from '../tool/Tool';
export interface IEditorEventBus {
    readonly clientArea: HTMLElement;
    readonly isMoleculeEditBusy: boolean;
    on(handlerName: ToolEventHandlerName | string, handler: (e: Event) => boolean | void, priority?: number): void;
    off(handlerName: ToolEventHandlerName | string, handler: (e: Event) => boolean | void): void;
    destroy(): void;
    getSubscription(handlerName: string): DOMSubscription | undefined;
}
export declare class EditorEventBus implements IEditorEventBus {
    readonly clientArea: HTMLElement;
    private dispatchDepth;
    private primaryPointerDown;
    private subs;
    private listeners;
    constructor(clientArea: HTMLElement);
    get isMoleculeEditBusy(): boolean;
    private setup;
    on(handlerName: string, handler: (e: Event) => boolean | void, priority?: number): void;
    off(handlerName: string, handler: (e: Event) => boolean | void): void;
    destroy(): void;
    getSubscription(handlerName: string): DOMSubscription | undefined;
}
