import { type Result } from 'molecule-contracts';
import type { MoleculeCanvasEditSource, MoleculeCanvasEditorOptions, MoleculeCanvasObserver } from './types.js';
/** Prepare in an isolated engine; the host remains the only canvas authority. */
export declare function createMoleculeCanvasEditor(source: MoleculeCanvasEditSource, options?: MoleculeCanvasEditorOptions): Result<MoleculeCanvasObserver>;
