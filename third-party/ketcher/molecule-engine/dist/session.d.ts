import { type Result } from 'molecule-contracts';
import type { MoleculeSession, MoleculeSessionOptions } from './types.js';
/**
 * Own one basic-graph document in memory. All methods are synchronous, so the
 * revision check and state replacement share one JavaScript critical section.
 * Hosts must provide their own authorization and persistence.
 */
export declare function createMoleculeSession(options: MoleculeSessionOptions): Result<MoleculeSession>;
