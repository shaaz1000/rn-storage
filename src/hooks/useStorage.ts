// src/hooks/useStorage.ts

import { useState, useEffect, useCallback } from "react";
import StorageManager from '../core/storageManager';
import OfflineSync from '../core/offlineSync';
import CacheManager from '../core/cacheManager';

interface UseStorageOptions {
    encrypt?: boolean;
    cache?: boolean;
    sync?: boolean;
    expiryTime?: number;
}

export function useStorage<T>(key: string, initialValue: T, options: UseStorageOptions = {}) {
    const [value, setValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const storage = StorageManager.getInstance();
    const cache = CacheManager.getInstance();
    const offlineSync = OfflineSync.getInstance();

    // Load initial value
    useEffect(() => {
        const loadValue = async () => {
            try {
                setLoading(true);
                let storedValue: T | null = null;

                if (options.cache) {
                    storedValue = await cache.get(key);
                }

                if (!storedValue) {
                    storedValue = await storage.getItem(key, options.encrypt);
                }

                if (storedValue !== null) {
                    setValue(storedValue);
                }
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadValue();
    }, [key]);

    // Update value
    const updateValue = useCallback(async (newValue: T) => {
        try {
            setLoading(true);

            if (options.cache) {
                await cache.set(key, newValue, options.expiryTime);
            }

            await storage.setItem(key, newValue, options.encrypt, options.expiryTime);

            if (options.sync) {
                await offlineSync.queueOperation({
                    key,
                    value: newValue,
                    operation: 'set',
                    timestamp: Date.now()
                });
            }

            setValue(newValue);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, options]);

    // Remove value
    const removeValue = useCallback(async () => {
        try {
            setLoading(true);

            if (options.cache) {
                await cache.remove(key);
            }

            await storage.removeItem(key);

            if (options.sync) {
                await offlineSync.queueOperation({
                    key,
                    value: null,
                    operation: 'remove',
                    timestamp: Date.now()
                });
            }

            setValue(initialValue);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, options]);

    return {
        value,
        setValue: updateValue,
        remove: removeValue,
        loading,
        error,
    };
}

export default useStorage;