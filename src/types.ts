// src/types.ts

export interface StorageData {
    value: any;
    timestamp: number;
    expiryTime?: number;
}

export interface CacheConfig {
    expiryTime?: number;
    maxSize?: number;
    encryptData?: boolean;
}

export interface SyncConfig {
    syncInterval?: number;
    retryAttempts?: number;
    onSyncComplete?: (success: boolean) => void;
    onSyncError?: (error: Error) => void;
}

export interface NetworkStatus {
    isConnected: boolean;
    lastSyncTime?: number;
}

export interface QueueItem {
    key: string;
    value: any;
    operation: 'set' | 'remove';
    timestamp: number;
}