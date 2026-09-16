import type { Subscription } from 'subscription';
export declare function runMoleculeListener(callback: () => unknown): unknown;
export declare function dispatchMoleculeListeners(subscription: Subscription, initialValue?: unknown, pipeline?: boolean): void;
