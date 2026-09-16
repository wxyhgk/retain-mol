/**
 * LocalStorage adapter for settings persistence
 * Wraps browser localStorage with error handling and availability checks
 */
import type { ISettingsStorage, Settings } from './types';
export declare class LocalStorageAdapter implements ISettingsStorage {
    /**
     * Load settings from localStorage
     * Returns null if not found or on error
     */
    load(key: string): Promise<Partial<Settings> | null>;
    /**
     * Save settings to localStorage
     * Throws error if localStorage is not available
     */
    save(key: string, settings: Settings): Promise<void>;
    /**
     * Clear settings from localStorage
     */
    clear(key: string): Promise<void>;
    /**
     * Check if localStorage is available
     */
    isAvailable(): boolean;
}
