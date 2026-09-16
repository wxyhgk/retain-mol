declare class LocalStorageWrapper {
    localStorage: Storage;
    constructor();
    getItem(key: string): any;
    setItem(key: string, item: unknown): void;
    removeItem(key: string): void;
}
export declare const localStorageWrapper: LocalStorageWrapper;
export {};
