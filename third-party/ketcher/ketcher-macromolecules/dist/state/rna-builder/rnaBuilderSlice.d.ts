/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import { PayloadAction } from '@reduxjs/toolkit';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { RootState } from 'state';
import { LabeledNodesWithPositionInSequence, MonomerOrAmbiguousType, RnaPhosphatePosition } from 'ketcher-core';
import { MonomerGroups } from 'src/constants';
export declare enum RnaBuilderPresetsItem {
    Presets = "Presets"
}
export type RnaBuilderNucleotidesItem = 'Nucleotides';
export type RnaBuilderItem = RnaBuilderPresetsItem | MonomerGroups | RnaBuilderNucleotidesItem;
export interface PresetPhosphateFilter {
    fivePrime: boolean;
    threePrime: boolean;
    noPhosphate: boolean;
}
interface IRnaBuilderState {
    activePreset: IRnaPreset | null;
    sequenceSelection: LabeledNodesWithPositionInSequence[] | undefined;
    sequenceSelectionName: string | undefined;
    isSequenceFirstsOnlyNucleoelementsSelected: boolean | undefined;
    activePresetMonomerGroup: {
        groupName: MonomerGroups;
        groupItem: MonomerOrAmbiguousType;
    } | null;
    groupItemValidations: {
        [MonomerGroups.BASES]: string[];
        [MonomerGroups.SUGARS]: string[];
        [MonomerGroups.PHOSPHATES]: string[];
    };
    presetsDefault: IRnaPreset[];
    presetsCustom: IRnaPreset[];
    activeRnaBuilderItem?: RnaBuilderItem | null;
    activeMonomerKey: string | null;
    isEditMode: boolean;
    uniqueNameError: string;
    invalidPresetError: string;
    invalidPresetNameError: string;
    activePresetForContextMenu: IRnaPreset | null;
    presetPhosphateFilter: PresetPhosphateFilter;
}
export declare const monomerGroupToPresetGroup: {
    Bases: string;
    Sugars: string;
    Phosphates: string;
};
export declare const rnaBuilderSlice: import("@reduxjs/toolkit").Slice<IRnaBuilderState, {
    createNewPreset: (state: import("immer").WritableDraft<IRnaBuilderState>) => void;
    setActivePreset: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<IRnaPreset>) => void;
    setSequenceSelection: (state: RootState, action: PayloadAction<LabeledNodesWithPositionInSequence[]>) => void;
    setSequenceSelectionName: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<string>) => void;
    setIsSequenceFirstsOnlyNucleoelementsSelected: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<boolean>) => void;
    setActivePresetForContextMenu: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<IRnaPreset>) => void;
    setPresetPhosphateFilter: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<PresetPhosphateFilter>) => void;
    setActivePresetName: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<string>) => void;
    setActiveRnaBuilderItem: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<RnaBuilderItem | null>) => void;
    recalculateRnaBuilderValidations: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<{
        rnaPreset: IRnaPreset;
        isEditMode: boolean;
        selectedPhosphatePosition?: RnaPhosphatePosition;
    }>) => void;
    setActivePresetMonomerGroup: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<{
        groupName: MonomerGroups;
        groupItem: MonomerOrAmbiguousType;
    } | null>) => void;
    savePreset: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<IRnaPreset>) => void;
    deletePreset: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<IRnaPreset>) => void;
    setIsEditMode: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<boolean>) => void;
    setUniqueNameError: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<string>) => void;
    setInvalidPresetError: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<string>) => void;
    setInvalidPresetNameError: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<string>) => void;
    setDefaultPresets: (state: RootState, action: PayloadAction<IRnaPreset[]>) => void;
    setCustomPresets: (state: RootState, action: PayloadAction<IRnaPreset[]>) => void;
    setFavoritePresetsFromLocalStorage: (state: RootState) => void;
    clearFavorites: (state: RootState) => void;
    setActiveMonomerKey: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<string>) => void;
    togglePresetFavorites: (state: import("immer").WritableDraft<IRnaBuilderState>, action: PayloadAction<IRnaPreset>) => void;
}, "rna-builder", "rna-builder", import("@reduxjs/toolkit").SliceSelectors<IRnaBuilderState>>;
export declare const selectRnaBuilderSlice: (state: RootState) => IRnaBuilderState;
export declare const selectActiveRnaBuilderItem: (state: RootState) => RnaBuilderItem;
export declare const selectGroupItemValidations: (state: RootState) => RnaBuilderItem;
export declare const selectActivePreset: (state: RootState) => IRnaPreset;
export declare const selectSequenceSelection: (state: RootState) => LabeledNodesWithPositionInSequence[];
export declare const selectSequenceSelectionName: (state: RootState) => string;
export declare const selectIsSequenceFirstsOnlyNucleotidesSelected: (state: RootState) => boolean;
export declare const selectCurrentMonomerGroup: (preset: IRnaPreset, groupName: MonomerGroups | string) => any;
export declare const selectActivePresetMonomerGroup: (state: RootState) => any;
export declare const selectIsPresetReadyToSave: (preset: IRnaPreset) => boolean;
export declare const selectIsEditMode: (state: RootState) => boolean;
export declare const selectPresetFullName: (preset: IRnaPreset) => string;
export declare const selectUniqueNameError: (state: RootState) => any;
export declare const selectInvalidPresetError: (state: RootState) => any;
export declare const selectInvalidPresetNameError: (state: RootState) => any;
export declare const selectIsActivePresetNewAndEmpty: (state: RootState) => boolean;
export declare const selectActivePresetForContextMenu: (state: RootState) => any;
export declare const selectPresetPhosphateFilter: (state: RootState) => PresetPhosphateFilter;
export declare const selectPresetsInFavorites: (items: IRnaPreset[]) => IRnaPreset[];
export declare const selectActiveMonomerKey: (state: RootState) => any;
export declare const selectAllPresets: ((state: any) => (IRnaPreset & {
    favorite?: boolean;
})[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: IRnaBuilderState) => (IRnaPreset & {
        favorite?: boolean;
    })[];
    memoizedResultFunc: ((resultFuncArgs_0: IRnaBuilderState) => (IRnaPreset & {
        favorite?: boolean;
    })[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => (IRnaPreset & {
        favorite?: boolean;
    })[];
    dependencies: [(state: RootState) => IRnaBuilderState];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectFilteredPresets: ((state: any) => (IRnaPreset & {
    favorite?: boolean;
})[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: (IRnaPreset & {
        favorite?: boolean;
    })[], resultFuncArgs_1: string, resultFuncArgs_2: Map<string, string>, resultFuncArgs_3: PresetPhosphateFilter) => (IRnaPreset & {
        favorite?: boolean;
    })[];
    memoizedResultFunc: ((resultFuncArgs_0: (IRnaPreset & {
        favorite?: boolean;
    })[], resultFuncArgs_1: string, resultFuncArgs_2: Map<string, string>, resultFuncArgs_3: PresetPhosphateFilter) => (IRnaPreset & {
        favorite?: boolean;
    })[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => (IRnaPreset & {
        favorite?: boolean;
    })[];
    dependencies: [((state: any) => (IRnaPreset & {
        favorite?: boolean;
    })[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: IRnaBuilderState) => (IRnaPreset & {
            favorite?: boolean;
        })[];
        memoizedResultFunc: ((resultFuncArgs_0: IRnaBuilderState) => (IRnaPreset & {
            favorite?: boolean;
        })[]) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => (IRnaPreset & {
            favorite?: boolean;
        })[];
        dependencies: [(state: RootState) => IRnaBuilderState];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, (state: RootState) => string, ((state: any) => Map<string, string>) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    } & {
        resultFunc: (resultFuncArgs_0: any) => Map<string, string>;
        memoizedResultFunc: ((resultFuncArgs_0: any) => Map<string, string>) & {
            clearCache: () => void;
            resultsCount: () => number;
            resetResultsCount: () => void;
        };
        lastResult: () => Map<string, string>;
        dependencies: [(state: RootState) => any];
        recomputations: () => number;
        resetRecomputations: () => void;
        dependencyRecomputations: () => number;
        resetDependencyRecomputations: () => void;
    } & {
        argsMemoize: typeof import("reselect").weakMapMemoize;
        memoize: typeof import("reselect").weakMapMemoize;
    }, (state: RootState) => PresetPhosphateFilter];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    argsMemoize: typeof import("reselect").weakMapMemoize;
    memoize: typeof import("reselect").weakMapMemoize;
};
export declare const setActivePreset: import("@reduxjs/toolkit").ActionCreatorWithPayload<IRnaPreset, "rna-builder/setActivePreset">, setSequenceSelection: import("@reduxjs/toolkit").ActionCreatorWithPayload<LabeledNodesWithPositionInSequence[], "rna-builder/setSequenceSelection">, setSequenceSelectionName: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "rna-builder/setSequenceSelectionName">, setIsSequenceFirstsOnlyNucleoelementsSelected: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "rna-builder/setIsSequenceFirstsOnlyNucleoelementsSelected">, setActivePresetName: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "rna-builder/setActivePresetName">, setActiveRnaBuilderItem: import("@reduxjs/toolkit").ActionCreatorWithPayload<RnaBuilderItem | null, "rna-builder/setActiveRnaBuilderItem">, setActiveMonomerKey: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "rna-builder/setActiveMonomerKey">, recalculateRnaBuilderValidations: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    rnaPreset: IRnaPreset;
    isEditMode: boolean;
    selectedPhosphatePosition?: RnaPhosphatePosition;
}, "rna-builder/recalculateRnaBuilderValidations">, setActivePresetMonomerGroup: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    groupName: MonomerGroups;
    groupItem: MonomerOrAmbiguousType;
} | null, "rna-builder/setActivePresetMonomerGroup">, savePreset: import("@reduxjs/toolkit").ActionCreatorWithPayload<IRnaPreset, "rna-builder/savePreset">, deletePreset: import("@reduxjs/toolkit").ActionCreatorWithPayload<IRnaPreset, "rna-builder/deletePreset">, createNewPreset: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"rna-builder/createNewPreset">, setIsEditMode: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "rna-builder/setIsEditMode">, setUniqueNameError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "rna-builder/setUniqueNameError">, setInvalidPresetError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "rna-builder/setInvalidPresetError">, setInvalidPresetNameError: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "rna-builder/setInvalidPresetNameError">, setDefaultPresets: import("@reduxjs/toolkit").ActionCreatorWithPayload<IRnaPreset[], "rna-builder/setDefaultPresets">, setCustomPresets: import("@reduxjs/toolkit").ActionCreatorWithPayload<IRnaPreset[], "rna-builder/setCustomPresets">, setActivePresetForContextMenu: import("@reduxjs/toolkit").ActionCreatorWithPayload<IRnaPreset, "rna-builder/setActivePresetForContextMenu">, setPresetPhosphateFilter: import("@reduxjs/toolkit").ActionCreatorWithPayload<PresetPhosphateFilter, "rna-builder/setPresetPhosphateFilter">, togglePresetFavorites: import("@reduxjs/toolkit").ActionCreatorWithPayload<IRnaPreset, "rna-builder/togglePresetFavorites">, setFavoritePresetsFromLocalStorage: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"rna-builder/setFavoritePresetsFromLocalStorage">, clearFavorites: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"rna-builder/clearFavorites">;
export declare const rnaBuilderReducer: import("redux").Reducer<IRnaBuilderState>;
export {};
