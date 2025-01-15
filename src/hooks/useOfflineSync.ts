// src/hooks/useOfflineSync.ts

import { useState, useEffect, useCallback } from 'react';
import { QueueItem, SyncConfig } from '../types';
import OfflineSync from '../core/offlineSync';

export function useOfflineSync(config?: SyncConfig) {
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
    const [lastSyncTime, setLastSyncTime] = useState<number | undefined>(undefined);
    const [pendingOperations, setPendingOperations] = useState<QueueItem[]>([]);

    const offlineSync = OfflineSync.getInstance();

    // Initialize sync configuration
    useEffect(() => {
        if (config) {
            offlineSync.configure({
                ...config,
                onSyncComplete: (success) => {
                    setSyncStatus('idle');
                    if (success) {
                        setLastSyncTime(Date.now());
                    }
                    config.onSyncComplete?.(success);
                },
                onSyncError: (error) => {
                    setSyncStatus('error');
                    config.onSyncError?.(error);
                }
            });
        }
    }, [config]);

    // Load initial state
    useEffect(() => {
        const loadState = async () => {
            const time = await offlineSync.getLastSyncTime();
            setLastSyncTime(time);

            const operations = await offlineSync.getPendingOperations();
            setPendingOperations(operations);
        };

        loadState();
    }, []);

    // Queue operation
    const queueOperation = useCallback(async (operation: QueueItem) => {
        await offlineSync.queueOperation(operation);
        const operations = await offlineSync.getPendingOperations();
        setPendingOperations(operations);
    }, []);

    // Force sync
    const forceSync = useCallback(async () => {
        setSyncStatus('syncing');
        try {
            await offlineSync.syncQueuedItems();
            const operations = await offlineSync.getPendingOperations();
            setPendingOperations(operations);
        } catch (error) {
            setSyncStatus('error');
            throw error;
        }
    }, []);

    // Stop sync
    const stopSync = useCallback(() => {
        offlineSync.stopSync();
        setSyncStatus('idle');
    }, []);

    return {
        syncStatus,
        lastSyncTime,
        pendingOperations,
        queueOperation,
        forceSync,
        stopSync
    };
}