import type { AtomLabel, AttachmentPointName } from 'ketcher-core';
import type Editor from '../../../../../editor/index';
type Props = {
    name: AttachmentPointName;
    editor: Editor;
    onNameChange: (currentName: AttachmentPointName, newName: AttachmentPointName) => void;
    onLeavingAtomChange: (apName: AttachmentPointName, newLeavingAtomLabel: AtomLabel) => void;
    onRemove: (name: AttachmentPointName) => void;
};
declare const AttachmentPoint: ({ name, editor, onNameChange, onLeavingAtomChange, onRemove, }: Props) => import("react").JSX.Element | null;
export default AttachmentPoint;
