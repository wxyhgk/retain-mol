import { IKetIdtAliases } from 'ketcher-core';
import { PresetPosition } from 'state';
type Props = {
    presetName: string | undefined;
    position: PresetPosition;
    idtAliases: IKetIdtAliases | undefined;
};
declare const useIDTAliasesTextForPreset: ({ presetName, position, idtAliases, }: Props) => string | null | undefined;
export default useIDTAliasesTextForPreset;
