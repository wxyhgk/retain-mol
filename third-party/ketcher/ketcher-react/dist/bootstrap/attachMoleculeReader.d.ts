import { type Editor, type Ketcher } from 'ketcher-core';
/** Bind eagerly during initialization, before a pointer gesture can preview. */
export declare function attachMoleculeReader(ketcher: Ketcher, editor: Editor): () => void;
