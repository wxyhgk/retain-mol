import { ReactNode } from 'react';
import { BaseMonomer, UsageInMacromolecule } from 'ketcher-core';
interface Props {
    monomer: BaseMonomer;
    attachmentPoints: ReactNode;
    usage: UsageInMacromolecule;
    connectedAttachmentPoints?: string[];
    selectedAttachmentPoint?: string | null;
    needCache?: boolean;
    update?: boolean;
    expanded?: boolean;
    testId?: string;
}
declare const MonomerOverview: ({ monomer, attachmentPoints, connectedAttachmentPoints, selectedAttachmentPoint, usage, needCache, update, expanded, testId, }: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export default MonomerOverview;
