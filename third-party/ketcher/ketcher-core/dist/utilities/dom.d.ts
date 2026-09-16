export declare function blurActiveElement(): void;
export declare function isEditableInputTarget(target: EventTarget | null): boolean;
/**
 * Wraps an event handler so it only fires when the macromolecules (polymer) editor is active.
 *
 * Both micro and macro editors coexist in the DOM simultaneously (one is visually hidden).
 * Use this guard on any window- or document-level event handler registered by macromolecules
 * editor components to prevent them from intercepting events while the micromolecules editor
 * is active.
 *
 * @example
 * const handler = guardForMacromoleculesEditor((e: KeyboardEvent) => { ... });
 * window.addEventListener('keydown', handler);
 * // cleanup:
 * window.removeEventListener('keydown', handler);
 */
export declare function guardForMacromoleculesEditor<T extends (...args: any[]) => any>(handler: T): T;
/**
 * Wraps an event handler so it only fires when the micromolecules (small molecule) editor is active.
 *
 * Both micro and macro editors coexist in the DOM simultaneously (one is visually hidden).
 * Use this guard on any window- or document-level event handler registered by micromolecules
 * editor components to prevent them from intercepting events while the macromolecules editor
 * is active.
 *
 * @example
 * const handler = guardForMicromoleculesEditor((e: KeyboardEvent) => { ... });
 * window.addEventListener('keydown', handler);
 * // cleanup:
 * window.removeEventListener('keydown', handler);
 */
export declare function guardForMicromoleculesEditor<T extends (...args: any[]) => any>(handler: T): T;
