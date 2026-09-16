/**
 * Settings schema with defaults, validation schema, and presets
 * Migrated from ketcher-react options-schema.ts
 */
import type { Settings, DeepPartial } from './types';
/**
 * Complete default settings in flat format
 */
export declare const DEFAULT_SETTINGS: Settings;
/**
 * Get default settings
 */
export declare function getDefaultSettings(): Settings;
/**
 * Settings presets
 */
export declare const PRESETS: Record<string, DeepPartial<Settings>>;
/**
 * JSON Schema for settings validation
 * This is used by SchemaValidator
 */
export declare const SCHEMA: {
    title: string;
    type: string;
    properties: {
        resetToSelect: {
            enum: (string | boolean)[];
        };
        rotationStep: {
            type: string;
            minimum: number;
            maximum: number;
        };
        showValenceWarnings: {
            type: string;
        };
        atomColoring: {
            type: string;
        };
        font: {
            type: string;
        };
        fontsz: {
            type: string;
            minimum: number;
            maximum: number;
        };
        fontszUnit: {
            enum: string[];
        };
        fontszsub: {
            type: string;
            minimum: number;
            maximum: number;
        };
        fontszsubUnit: {
            enum: string[];
        };
        showStereoFlags: {
            type: string;
        };
        stereoLabelStyle: {
            enum: string[];
        };
        colorOfAbsoluteCenters: {
            type: string;
        };
        colorOfAndCenters: {
            type: string;
        };
        colorOfOrCenters: {
            type: string;
        };
        colorStereogenicCenters: {
            enum: string[];
        };
        autoFadeOfStereoLabels: {
            type: string;
        };
        absFlagLabel: {
            type: string;
        };
        andFlagLabel: {
            type: string;
        };
        orFlagLabel: {
            type: string;
        };
        mixedFlagLabel: {
            type: string;
        };
        ignoreChiralFlag: {
            type: string;
        };
        carbonExplicitly: {
            type: string;
        };
        showCharge: {
            type: string;
        };
        showValence: {
            type: string;
        };
        showHydrogenLabels: {
            enum: string[];
        };
        aromaticCircle: {
            type: string;
        };
        bondSpacing: {
            type: string;
            minimum: number;
            maximum: number;
        };
        bondLength: {
            type: string;
            minimum: number;
            maximum: number;
        };
        bondLengthUnit: {
            enum: string[];
        };
        bondThickness: {
            type: string;
            minimum: number;
            maximum: number;
        };
        bondThicknessUnit: {
            enum: string[];
        };
        stereoBondWidth: {
            type: string;
            minimum: number;
            maximum: number;
        };
        stereoBondWidthUnit: {
            enum: string[];
        };
        hashSpacing: {
            type: string;
            minimum: number;
            maximum: number;
        };
        hashSpacingUnit: {
            enum: string[];
        };
        imageResolution: {
            type: string;
        };
        reactionComponentMarginSize: {
            type: string;
            minimum: number;
            maximum: number;
        };
        reactionComponentMarginSizeUnit: {
            enum: string[];
        };
        'smart-layout': {
            type: string;
        };
        'ignore-stereochemistry-errors': {
            type: string;
        };
        'mass-skip-error-on-pseudoatoms': {
            type: string;
        };
        'gross-formula-add-rsites': {
            type: string;
        };
        'aromatize-skip-superatoms': {
            type: string;
        };
        'dearomatize-on-load': {
            type: string;
        };
        'gross-formula-add-isotopes': {
            type: string;
        };
        'valence-mode': {
            enum: string[];
        };
        showAtomIds: {
            type: string;
        };
        showBondIds: {
            type: string;
        };
        showHalfBondIds: {
            type: string;
        };
        showLoopIds: {
            type: string;
        };
        miewMode: {
            enum: string[];
        };
        miewTheme: {
            enum: string[];
        };
        miewAtomLabel: {
            enum: string[];
        };
        selectionTool: {
            type: string;
        };
        editorLineLength: {
            type: string;
        };
        disableCustomQuery: {
            type: string;
        };
        monomerLibraryUpdates: {
            type: string;
            items: {
                type: string;
            };
        };
        colorPickerCustomColors: {
            type: string;
            items: {
                type: string;
            };
        };
    };
};
