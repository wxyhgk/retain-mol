/**
 * Settings service implementation
 * Centralized settings management with validation, persistence, and reactive updates
 */
import type { ISettingsService } from './ISettingsService';
import { type Settings, type DeepPartial, type ValidationResult, type SettingsListener, type Unsubscribe, type SettingsServiceOptions } from './types';
/**
 * SettingsService implementation
 * Provides centralized, validated, and persistent settings management
 *
 * SINGLETON PATTERN - TEMPORARY WORKAROUND
 *
 * This class implements a singleton pattern to address the following issues:
 *
 * 1. React 18 Strict Mode in development causes components to mount → unmount → remount,
 *    which creates multiple Ketcher instances and multiple SettingsService instances.
 *    The second instance overwrites window.ketcher, causing settings sync issues.
 *
 * 2. Redux state in ketcher-react stores settings separately from SettingsService.
 *    When Settings dialog opens, it reads from Redux state which may be out of sync.
 *    The saveSettings() action uses window.ketcher.settingsService, but if multiple
 *    instances exist, they don't share subscribers or in-memory state.
 *
 * 3. Small molecules and macromolecules modes both access window.ketcher.settingsService,
 *    expecting them to be the same instance for settings to sync properly.
 *
 * WARNING: This singleton pattern prevents creating multiple independent SettingsService
 * instances with separate settings (e.g., for multi-editor scenarios). This should be
 * refactored in the future by:
 * - Fixing React component lifecycle to prevent double initialization
 * - Making Redux state fully synchronized with SettingsService via proper subscription
 * - Or removing Redux state dependency entirely and using SettingsService directly
 * - Supporting multiple SettingsService instances with isolated or shared settings as needed
 *
 * TODO: Remove this singleton and implement proper multi-instance support
 */
export declare class SettingsService implements ISettingsService {
    private static instance;
    private settings;
    private readonly storage;
    private readonly validator;
    private readonly emitter;
    private readonly storageKey;
    private readonly autoSave;
    private initialized;
    /**
     * Get the singleton instance of SettingsService.
     * Creates a new instance if one doesn't exist.
     *
     * @param options - Configuration options (only used when creating the first instance)
     * @returns The singleton SettingsService instance
     */
    static getInstance(options?: SettingsServiceOptions): Promise<SettingsService>;
    /**
     * Reset the singleton instance.
     * This is primarily for testing purposes or when you need to force
     * recreation of the settings service (e.g., after logout, context switch).
     * Use with caution as this will affect all code using SettingsService.getInstance().
     */
    static resetInstance(): void;
    /**
     * Private constructor to enforce singleton pattern.
     * Use SettingsService.getInstance() instead.
     */
    private constructor();
    /**
     * Initialize the service
     * Loads from storage, runs migrations, validates, and persists
     */
    init(): Promise<void>;
    /**
     * Get current settings (immutable)
     */
    getSettings(): Settings;
    /**
     * Update settings (deep merge, validates, persists, emits event)
     * Returns updated settings on success
     * Throws SettingsValidationError if validation fails
     */
    updateSettings(partial: DeepPartial<Settings>): Promise<Settings>;
    /**
     * Reset to default settings
     */
    resetToDefaults(): Promise<Settings>;
    /**
     * Load a preset
     */
    loadPreset(name: string): Promise<Settings>;
    /**
     * Get available preset names
     */
    getAvailablePresets(): string[];
    /**
     * Validate settings without applying
     */
    validateSettings(settings: Partial<Settings>): ValidationResult;
    /**
     * Export settings as JSON string
     */
    exportSettings(): string;
    /**
     * Import settings from JSON string
     */
    importSettings(json: string): Promise<Settings>;
    /**
     * Subscribe to settings changes
     * Returns unsubscribe function
     */
    subscribe(listener: SettingsListener): Unsubscribe;
    /**
     * Get the settings schema (for UI generation, documentation)
     */
    getSchema(): Record<string, DeepPartial<Settings>>;
    /**
     * Deep merge two objects
     */
    private deepMerge;
    /**
     * Merge partial settings with defaults
     */
    private mergeWithDefaults;
    /**
     * Deep freeze object to make it immutable
     */
    private freeze;
    /**
     * Assert that service is initialized
     */
    private assertInitialized;
}
