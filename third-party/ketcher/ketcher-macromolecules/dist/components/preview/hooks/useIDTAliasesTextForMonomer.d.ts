import { AttachmentPointsToBonds, IKetIdtAliases } from 'ketcher-core';
type Props = {
    idtAliases: IKetIdtAliases | undefined;
    attachmentPointsToBonds: AttachmentPointsToBonds | undefined;
};
declare const useIDTAliasesTextForMonomer: ({ idtAliases, attachmentPointsToBonds, }: Props) => string | null | undefined;
export default useIDTAliasesTextForMonomer;
