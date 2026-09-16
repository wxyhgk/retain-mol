import { type Atom } from 'ketcher-core';
import type { IToolContext } from './IToolContext';
type APointEditContext = Pick<IToolContext, 'event' | 'render' | 'update'>;
export declare function editRGroupAttachmentPoint(editor: APointEditContext, atom: Atom, atomId: number): Promise<void>;
export {};
