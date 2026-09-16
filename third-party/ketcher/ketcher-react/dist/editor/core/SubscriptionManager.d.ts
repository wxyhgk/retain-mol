import { type ChangeEventData } from '../utils';
interface SubscriptionManagerContext {
    event: object;
}
type SubscriptionHandler = ((data?: unknown) => void) | ((data: ChangeEventData[]) => void);
export interface SubscriptionManagerDependencies {
    addChangeHandler(handler: (action?: unknown) => void): void;
    removeChangeHandler(handler: (action?: unknown) => void): void;
    addLibraryUpdateHandler(handler: SubscriptionHandler): void;
    removeLibraryUpdateHandler(handler: SubscriptionHandler): void;
}
export interface ISubscriptionManager {
    subscribe(eventName: string, handler: SubscriptionHandler): {
        handler: SubscriptionHandler;
    };
    unsubscribe(eventName: string, subscriber: {
        handler: SubscriptionHandler;
    }): void;
}
export declare class SubscriptionManager implements ISubscriptionManager {
    private readonly editor;
    private readonly dependencies;
    constructor(editor: SubscriptionManagerContext, dependencies: SubscriptionManagerDependencies);
    subscribe(eventName: string, handler: SubscriptionHandler): {
        handler: SubscriptionHandler;
    };
    unsubscribe(eventName: string, subscriber: {
        handler: SubscriptionHandler;
    }): void;
}
export {};
