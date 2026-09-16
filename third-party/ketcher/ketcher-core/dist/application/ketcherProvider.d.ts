import type { Ketcher } from './ketcher';
declare class KetcherProvider {
    private readonly ketcherInstances;
    addKetcherInstance(instance: Ketcher): void;
    removeKetcherInstance(id: string): void;
    getIndexById(id: string): number;
    getKetcher(id?: string): Ketcher;
}
export declare const ketcherProvider: KetcherProvider;
export {};
