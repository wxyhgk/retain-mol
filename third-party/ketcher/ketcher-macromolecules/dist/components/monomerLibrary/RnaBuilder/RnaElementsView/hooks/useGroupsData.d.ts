import { LibraryNameType, MonomerGroups } from 'src/constants';
import { RnaBuilderPresetsItem } from 'state/rna-builder';
export declare const useGroupsData: (libraryName: LibraryNameType) => ({
    groupName: RnaBuilderPresetsItem;
    iconName: string;
    groups: {
        groupItems: (import("ketcher-core").IRnaPreset & {
            favorite?: boolean;
        })[];
    }[];
} | {
    groupName: MonomerGroups;
    iconName: string;
    groups: {
        groupItems: import("ketcher-core").MonomerItemType[];
        groupTitle?: string;
    }[];
})[];
export type GroupsData = ReturnType<typeof useGroupsData>;
