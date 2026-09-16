/**
 * In-memory storage adapter for settings
 * Useful for testing and environments without localStorage
 */
import type { ISettingsStorage, Settings } from './types';
export declare class MemoryStorageAdapter implements ISettingsStorage {
    private readonly storage;
    /**
     * Load settings from memory
     */
    load(key: string): Promise<Partial<Settings> | null>;
    /**
     * Save settings to memory
     */
    save(key: string, settings: Settings): Promise<void>;
    /**
     * Clear settings from memory
     */
    clear(key: string): Promise<void>;
    /**
     * Memory storage is always available
     */
    isAvailable(): boolean;
    /**
     * Clear all stored settings (useful for tests)
     */
    clearAll(): void;
}
