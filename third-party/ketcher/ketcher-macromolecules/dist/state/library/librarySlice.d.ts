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
import { Slice } from '@reduxjs/toolkit';
import { Group } from 'components/monomerLibrary/monomerLibraryList/types';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { MonomerItemType, MonomerOrAmbiguousType, MonomerGroups, AmbiguousMonomerType, IKetMonomerGroupTemplate } from 'ketcher-core';
import { LibraryNameType } from 'src/constants';
import { RootState } from 'state';
interface LibraryState {
    monomers: Group[];
    defaultRnaPresets: IKetMonomerGroupTemplate[];
    favorites: {
        [key: string]: Group;
    };
    searchFilter: string;
    selectedTabIndex: number;
}
export type GroupedAmbiguousMonomerLibraryItemType = {
    groupTitle: string;
    groupItems: AmbiguousMonomerType[];
};
export declare function getMonomerUniqueKey(monomer: MonomerOrAmbiguousType): string;
export declare function getPresetUniqueKey(preset: IRnaPreset): string;
export declare const librarySlice: Slice;
export declare const loadMonomerLibrary: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, any> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, any>, loadDefaultPresets: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, any> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, any>, setFavoriteMonomersFromLocalStorage: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, any> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, any>, clearFavorites: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, any> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, any>, toggleMonomerFavorites: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, any> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, any>, setSearchFilter: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, any> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, any>, setSelectedTabIndex: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<`${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPayload<any, `${string}/${string}`> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, never, any> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, never> | import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<any[], any, `${string}/${string}`, any, any>;
export declare const selectAxoLabsAliasesByPresetName: ((state: any) => Map<string, string>) & {
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
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectLibrarySlice: (state: RootState) => LibraryState;
export declare const selectSearchFilter: (state: RootState) => string;
export declare const selectMonomersInCategory: (items: MonomerOrAmbiguousType[], category: LibraryNameType) => MonomerItemType[];
export declare const selectAmbiguousMonomersInCategory: (libraryItems: MonomerOrAmbiguousType[], libraryGroupName: MonomerGroups) => GroupedAmbiguousMonomerLibraryItemType[];
export declare const selectUnsplitNucleotides: (items: MonomerOrAmbiguousType[]) => MonomerItemType[];
export declare const selectMonomersInFavorites: (items: MonomerOrAmbiguousType[]) => MonomerOrAmbiguousType[];
export declare const selectAmbiguousMonomersInFavorites: (items: MonomerOrAmbiguousType[]) => GroupedAmbiguousMonomerLibraryItemType[];
export declare const selectFilteredMonomers: ((state: any) => (MonomerOrAmbiguousType & {
    favorite: boolean;
})[]) & {
    clearCache: () => void;
    resultsCount: () => number;
    resetResultsCount: () => void;
} & {
    resultFunc: (resultFuncArgs_0: any) => (MonomerOrAmbiguousType & {
        favorite: boolean;
    })[];
    memoizedResultFunc: ((resultFuncArgs_0: any) => (MonomerOrAmbiguousType & {
        favorite: boolean;
    })[]) & {
        clearCache: () => void;
        resultsCount: () => number;
        resetResultsCount: () => void;
    };
    lastResult: () => (MonomerOrAmbiguousType & {
        favorite: boolean;
    })[];
    dependencies: [(state: RootState) => any];
    recomputations: () => number;
    resetRecomputations: () => void;
    dependencyRecomputations: () => number;
    resetDependencyRecomputations: () => void;
} & {
    memoize: typeof import("reselect").weakMapMemoize;
    argsMemoize: typeof import("reselect").weakMapMemoize;
};
export declare const selectMonomers: (state: RootState) => any;
export declare const selectMonomerGroups: (monomers: MonomerItemType[]) => Group[];
export declare const selectCurrentTabIndex: (state: any) => any;
export declare const libraryReducer: import("redux").Reducer<any>;
export declare const selectDefaultRnaPresets: (state: any) => any;
export {};
