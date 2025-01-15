// src/hooks/useCache.ts

import { useState, useEffect, useCallback } from 'react';
import CacheManager from '../core/cacheManager';

interface UseCacheOptions {
    expiryTime?: number;
    encryptData?: boolean;
}

export function useCache<T>(key: string, initialValue: T, options: UseCacheOptions = {}) {
    const [value, setValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const cache = CacheManager.getInstance({
        expiryTime: options.expiryTime,
        encryptData: options.encryptData
    });

    // Load cached value
    useEffect(() => {
        const loadValue = async () => {
            try {
                setLoading(true);
                const cachedValue = await cache.get(key);
                if (cachedValue !== null) {
                    setValue(cachedValue);
                }
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadValue();
    }, [key]);

    // Update cache
    const updateCache = useCallback(async (newValue: T) => {
        try {
            setLoading(true);
            await cache.set(key, newValue, options.expiryTime);
            setValue(newValue);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, options.expiryTime]);

    // Remove from cache
    const removeFromCache = useCallback(async () => {
        try {
            setLoading(true);
            await cache.remove(key);
            setValue(initialValue);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, initialValue]);

    // Clear entire cache
    const clearCache = useCallback(async () => {
        try {
            setLoading(true);
            await cache.clear();
            setValue(initialValue);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [initialValue]);

    return {
        value,
        setCache: updateCache,
        removeFromCache,
        clearCache,
        loading,
        error,
    };
}