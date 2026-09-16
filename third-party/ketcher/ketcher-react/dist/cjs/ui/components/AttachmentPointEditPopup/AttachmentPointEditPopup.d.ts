import { type AtomLabel, type AttachmentPointClickData, type AttachmentPointName } from 'ketcher-core';
import type { Editor } from '../../../editor/index';
type Props = {
    data: AttachmentPointClickData;
    onNameChange: (currentName: AttachmentPointName, newName: AttachmentPointName) => void;
    onLeavingAtomChange: (apName: AttachmentPointName, newLeavingAtomLabel: AtomLabel) => void;
    onClose: VoidFunction;
    editor: Editor;
};
declare const AttachmentPointEditPopup: ({ data, onNameChange, onLeavingAtomChange, onClose, editor, }: Props) => import("react").JSX.Element | null;
export default AttachmentPointEditPopup;
