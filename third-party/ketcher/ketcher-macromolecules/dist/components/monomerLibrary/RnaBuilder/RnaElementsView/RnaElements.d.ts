import { LibraryNameType } from 'src/constants';
import { IRnaPreset } from 'ketcher-core';
interface RnaUnifiedViewProps {
    view: 'tabs' | 'accordion';
    libraryName: LibraryNameType;
    duplicatePreset: (preset?: IRnaPreset) => void;
    editPreset: (preset: IRnaPreset) => void;
}
export declare const RnaElements: ({ view, libraryName, duplicatePreset, editPreset, }: RnaUnifiedViewProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
