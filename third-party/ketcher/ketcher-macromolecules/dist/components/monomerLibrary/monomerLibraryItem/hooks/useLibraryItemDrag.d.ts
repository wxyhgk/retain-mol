import { RefObject } from 'react';
import { IRnaPreset, MonomerOrAmbiguousType } from 'ketcher-core';
export declare const useLibraryItemDrag: <T extends HTMLElement>(item: IRnaPreset | MonomerOrAmbiguousType, itemRef: RefObject<T | null>) => void;
