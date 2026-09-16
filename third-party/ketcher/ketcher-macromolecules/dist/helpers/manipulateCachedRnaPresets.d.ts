import { IRnaLabeledPreset } from 'ketcher-core';
export declare const getCachedCustomRnaPresets: () => IRnaLabeledPreset[] | undefined;
export declare const setCachedCustomRnaPreset: (preset: IRnaLabeledPreset) => void;
export declare const deleteCachedCustomRnaPreset: (presetName?: string) => void;
export declare const toggleCachedCustomRnaPresetFavorites: (presetName?: string) => void;
