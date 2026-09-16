import { type AttachmentPointName, AtomLabel } from 'ketcher-core';
import type { Editor } from '../../../../editor/index';
import type { Option } from '../../../primitives/form/Select';
export type AttachmentPointSelectData = {
    nameOptions: Array<Option>;
    leavingAtomOptions: Array<Option>;
    currentNameOption?: Option;
    currentLeavingAtomOption?: Option;
};
export declare const createReadonlyAttachmentPointSelectData: (attachmentPointName: AttachmentPointName, leavingAtomLabel: AtomLabel) => AttachmentPointSelectData;
export declare const useAttachmentPointSelectsData: (editor: Editor, attachmentPointName: AttachmentPointName) => AttachmentPointSelectData | null;
