import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { RnaPhosphatePosition } from 'ketcher-core';
export declare const getPhosphatePositionAvailability: (newPreset: IRnaPreset) => {
    is3PrimeAvailable: boolean;
    is5PrimeAvailable: boolean;
};
export declare const getValidations: (newPreset: IRnaPreset, isEditMode: boolean, selectedPhosphatePosition?: RnaPhosphatePosition) => {
    sugarValidations: string[];
    phosphateValidations: string[];
    baseValidations: string[];
};
export declare const isValidPresetName: (name: string) => boolean;
