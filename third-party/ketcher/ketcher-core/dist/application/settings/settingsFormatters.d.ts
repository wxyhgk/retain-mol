/**
 * Helpers for normalizing settings between SettingsService format and UI form
 * formats used by Ketcher packages.
 */
import type { Settings } from './types';
export type SettingsFormValue = Partial<Omit<Settings, 'imageResolution' | 'stereoLabelStyle' | 'showHydrogenLabels'>> & {
    readonly imageResolution?: Settings['imageResolution'] | string;
    readonly stereoLabelStyle?: Settings['stereoLabelStyle'] | 'Iupac' | 'Classic' | 'On' | 'Off';
    readonly showHydrogenLabels?: Settings['showHydrogenLabels'] | 'all';
    readonly init?: unknown;
};
export interface NormalizeSettingsFromCoreOptions {
    readonly removeCoreOnlyFields?: boolean;
}
/**
 * Normalize settings collected from UI forms or legacy Redux state to the
 * canonical SettingsService format validated by ketcher-core.
 */
export declare function normalizeSettingsForCore(settings: SettingsFormValue): Partial<Settings>;
/**
 * Normalize SettingsService values for UI controls that still use legacy form
 * enum/string values.
 */
export declare function normalizeSettingsForForm(settings: Partial<Settings>, options?: NormalizeSettingsFromCoreOptions): SettingsFormValue;
