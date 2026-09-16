import { PreparedAttachmentPointData } from 'components/preview/hooks/useAttachmentPoints';
interface Props {
    attachmentPoints: PreparedAttachmentPointData[];
    attachmentPointInBond: string | undefined;
}
declare const BondAttachmentPoints: ({ attachmentPoints, attachmentPointInBond, }: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export default BondAttachmentPoints;
