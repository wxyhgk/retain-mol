import type { ChangeSet, MoleculeDocumentSnapshot, MoleculeEditRequest, ReferenceMap, Result } from 'molecule-contracts';
export declare const MAX_ATOMS = 10000;
export declare const MAX_BONDS = 20000;
export declare function validateGraph(snapshot: MoleculeDocumentSnapshot): Result<MoleculeDocumentSnapshot>;
export declare function diffGraph(before: MoleculeDocumentSnapshot, after: MoleculeDocumentSnapshot): ChangeSet;
interface Draft {
    candidate: MoleculeDocumentSnapshot;
    changes: ChangeSet;
    refs: ReferenceMap;
}
/** All mutations below are confined to this unpublished, request-local draft. */
export declare function buildDraft(snapshot: MoleculeDocumentSnapshot, request: MoleculeEditRequest, idPrefix: string, reservedIds: ReadonlySet<string>): Result<Draft>;
export {};
