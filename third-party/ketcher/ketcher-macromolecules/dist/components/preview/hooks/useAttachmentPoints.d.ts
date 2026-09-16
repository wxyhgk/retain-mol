import { AttachmentPointName, AttachmentPointsToBonds } from 'ketcher-core';
type Props = {
    monomerCaps: Partial<Record<AttachmentPointName, string>> | undefined;
    attachmentPointsToBonds: AttachmentPointsToBonds | undefined;
};
export type PreparedAttachmentPointData = {
    id: string;
    label: string;
    connected: boolean;
};
type ReturnType = {
    preparedAttachmentPointsData: PreparedAttachmentPointData[];
    connectedAttachmentPoints: string[];
};
export declare const useAttachmentPoints: ({ monomerCaps, attachmentPointsToBonds, }: Props) => ReturnType;
export {};
