import { BaseMonomer, UsageInMacromolecule } from 'ketcher-core';
interface Props {
    monomer: BaseMonomer;
    usage: UsageInMacromolecule;
    connectedAttachmentPoints?: string[];
    selectedAttachmentPoint?: string | null;
    expanded?: boolean;
    testId?: string;
}
declare const MonomerMiniature: ({ monomer, expanded, selectedAttachmentPoint, connectedAttachmentPoints, usage, testId, }: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export default MonomerMiniature;
