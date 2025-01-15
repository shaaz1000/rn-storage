// src/core/cacheManager.ts

import StorageManager from './storageManager';

interface CacheConfig {
    expiryTime?: number; // in milliseconds
    maxSize?: number; // maximum number of items
    encryptData?: boolean;
}

class CacheManager {
    private static instance: CacheManager;
    private storage: StorageManager;
    private config: CacheConfig;

    private constructor(config: CacheConfig = {}) {
        this.storage = StorageManager.getInstance();
        this.config = {
            expiryTime: 1000 * 60 * 60, // 1 hour default
            maxSize: 100,
            encryptData: false,
            ...config
        };
    }

    /**
     * Get CacheManager instance
     */
    public static getInstance(config?: CacheConfig): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager(config);
        }
        return CacheManager.instance;
    }

    /**
     * Update cache configuration
     * @param newConfig - New configuration options
     */
    public updateConfig(newConfig: Partial<CacheConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }

    /**
     * Set cache item
     * @param key - Cache key
     * @param value - Value to cache
     * @param customExpiryTime - Optional custom expiry time
     */
    async set(key: string, value: any, customExpiryTime?: number): Promise<void> {
        const keys = await this.storage.getAllKeys();

        // Check cache size limit
        if (keys.length >= (this.config.maxSize || 100) && !(await this.storage.hasKey(key))) {
            // Remove oldest item if cache is full
            const oldestKey = await this.findOldestKey();
            if (oldestKey) {
                await this.storage.removeItem(oldestKey);
            }
        }

        await this.storage.setItem(
            key,
            value,
            this.config.encryptData || false,
            customExpiryTime || this.config.expiryTime
        );
    }

    /**
     * Get cache item
     * @param key - Cache key
     */
    async get(key: string): Promise<any> {
        return await this.storage.getItem(key, this.config.encryptData || false);
    }

    /**
     * Remove cache item
     * @param key - Cache key
     */
    async remove(key: string): Promise<void> {
        await this.storage.removeItem(key);
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        await this.storage.clear();
    }

    /**
     * Find oldest cache item
     */
    private async findOldestKey(): Promise<string | null> {
        const keys = await this.storage.getAllKeys();
        if (keys.length === 0) return null;

        let oldestKey = keys[0];
        let oldestTime = Date.now();

        for (const key of keys) {
            const item = await this.storage.getItem(key);
            if (item && item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    /**
     * Get current cache size
     */
    async getCacheSize(): Promise<number> {
        const keys = await this.storage.getAllKeys();
        return keys.length;
    }

    /**
     * Check if key exists in cache
     */
    async has(key: string): Promise<boolean> {
        return await this.storage.hasKey(key);
    }
}

export default CacheManager;