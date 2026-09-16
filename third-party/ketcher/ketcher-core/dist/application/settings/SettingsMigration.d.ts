/**
 * Settings migration logic for backward compatibility
 * Handles migration from namespaced format back to flat format
 */
import type { Settings, DeepPartial } from './types';
export declare class SettingsMigration {
    /**
     * Migrate settings from namespaced format back to flat format
     * Handles legacy namespaced storage and ensures flat structure
     */
    static migrate(stored: unknown): DeepPartial<Settings>;
    /**
     * Check if settings are in flat format
     * Flat format has top-level setting keys and no category keys
     */
    private static isFlatFormat;
    /**
     * Flatten namespaced structure by spreading all categories
     */
    private static migrateFromNamespacedFormat;
    /**
     * Attempt to load from legacy storage keys
     * Tries both 'ketcher-opts' and 'ketcher_editor_saved_settings'
     */
    static loadFromLegacyStorage(): DeepPartial<Settings> | null;
}
