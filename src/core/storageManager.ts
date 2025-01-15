// src/core/storageManager.ts

import Encryption from '../utils/encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageData {
    value: any;
    timestamp: number;
    expiryTime?: number;
}

class StorageManager {
    private static instance: StorageManager;
    private memoryCache: { [key: string]: StorageData } = {};

    private constructor() {
        // Private constructor for singleton
    }

    /**
     * Initialize storage with encryption key
     * @param encryptionKey - Key used for encrypting/decrypting data
     */
    static initialize(encryptionKey: string) {
        Encryption.initialize(encryptionKey);
    }

    static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    /**
     * Set item in storage
     * @param key - Storage key
     * @param value - Value to store
     * @param encrypt - Whether to encrypt the data
     * @param expiryTime - Time in milliseconds after which the data expires
     */
    async setItem(key: string, value: any, encrypt: boolean = false, expiryTime?: number): Promise<void> {
        const storageData: StorageData = {
            value: encrypt ? Encryption.encrypt(value) : value,
            timestamp: Date.now(),
            expiryTime
        };

        // Store in memory cache
        this.memoryCache[key] = storageData;

        // Store in AsyncStorage
        try {
            await AsyncStorage.setItem(key, JSON.stringify(storageData));
        } catch (error) {
            console.error('Error storing data:', error);
            throw new Error('Failed to store data');
        }
    }

    /**
     * Get item from storage
     * @param key - Storage key
     * @param decrypt - Whether to decrypt the data
     */
    async getItem(key: string, decrypt: boolean = false): Promise<any | null> {
        try {
            // Try memory cache first
            let data = this.memoryCache[key];

            // If not in memory cache, try AsyncStorage
            if (!data) {
                const storedData = await AsyncStorage.getItem(key);
                if (storedData) {
                    data = JSON.parse(storedData);
                    this.memoryCache[key] = data; // Update memory cache
                }
            }

            if (!data) return null;

            // Check if data has expired
            if (data.expiryTime && Date.now() - data.timestamp > data.expiryTime) {
                await this.removeItem(key);
                return null;
            }

            return decrypt ? Encryption.decrypt(data.value) : data.value;
        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    }

    /**
     * Remove item from storage
     * @param key - Storage key
     */
    async removeItem(key: string): Promise<void> {
        try {
            delete this.memoryCache[key];
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing data:', error);
            throw new Error('Failed to remove data');
        }
    }

    /**
     * Clear all storage
     */
    async clear(): Promise<void> {
        try {
            this.memoryCache = {};
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw new Error('Failed to clear storage');
        }
    }

    /**
     * Get all keys in storage
     */
    async getAllKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return [...keys]; // Convert readonly array to mutable array
        } catch (error) {
            console.error('Error getting keys:', error);
            return [];
        }
    }

    /**
     * Check if key exists in storage
     * @param key - Storage key
     */
    async hasKey(key: string): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value !== null;
        } catch (error) {
            console.error('Error checking key:', error);
            return false;
        }
    }
}

export default StorageManager;