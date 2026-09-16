import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { IKetTemplateConnection, IKetMonomerGroupTemplate, MonomerOrAmbiguousType, IRnaLabeledPreset } from 'ketcher-core';
interface RnaPresetsTemplatesType extends Pick<IKetMonomerGroupTemplate, 'templates' | 'idtAliases' | 'aliasAxoLabs'>, Partial<Pick<IKetMonomerGroupTemplate, 'connections'>>, Pick<IRnaLabeledPreset, 'default' | 'favorite' | 'name'> {
    connections?: IKetTemplateConnection[];
}
export declare const getPresets: (monomers: ReadonlyArray<MonomerOrAmbiguousType>, rnaPresetsTemplates: ReadonlyArray<RnaPresetsTemplatesType>, isDefault?: boolean) => IRnaPreset[];
export {};
