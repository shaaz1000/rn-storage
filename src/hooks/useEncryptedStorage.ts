// src/hooks/useEncryptedStorage.ts

import { useState, useEffect, useCallback } from 'react';
import StorageManager from 'src/core/storageManager';

export function useEncryptedStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const storage = StorageManager.getInstance();

    // Load encrypted value
    useEffect(() => {
        const loadValue = async () => {
            try {
                setLoading(true);
                const storedValue = await storage.getItem(key, true); // Always decrypt
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

    // Update encrypted value
    const setEncryptedValue = useCallback(async (newValue: T) => {
        try {
            setLoading(true);
            await storage.setItem(key, newValue, true); // Always encrypt
            setValue(newValue);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key]);

    // Remove encrypted value
    const removeValue = useCallback(async () => {
        try {
            setLoading(true);
            await storage.removeItem(key);
            setValue(initialValue);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [key, initialValue]);

    return {
        value,
        setValue: setEncryptedValue,
        remove: removeValue,
        loading,
        error,
    };
}