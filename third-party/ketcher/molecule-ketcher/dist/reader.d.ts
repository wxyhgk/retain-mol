import type { Struct } from 'ketcher-core';
import { type Result } from 'molecule-contracts';
import type { MoleculeCanvasObserver, MoleculeCanvasReaderOptions, MoleculeCanvasSource } from './types.js';
export interface CanvasIdentityMap {
    atoms: ReadonlyMap<number, string>;
    bonds: ReadonlyMap<number, string>;
}
/** Internal mapping port. Never exported from the package public entrypoint. */
export interface CanvasReaderController {
    reader: MoleculeCanvasObserver;
    getIdentities(struct: Struct): CanvasIdentityMap | undefined;
    registerIdentities(struct: Struct, mapping: CanvasIdentityMap): void;
}
/** Capture only committed changes; never project the live model on reads. */
export declare function createCanvasReaderController(source: MoleculeCanvasSource, options?: MoleculeCanvasReaderOptions): Result<CanvasReaderController>;
export declare function createMoleculeCanvasReader(source: MoleculeCanvasSource, options?: MoleculeCanvasReaderOptions): Result<MoleculeCanvasObserver>;
