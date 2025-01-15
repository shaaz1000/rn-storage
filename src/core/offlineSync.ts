// src/core/offlineSync.ts

import NetInfo from '@react-native-community/netinfo';
import { SyncConfig, NetworkStatus, QueueItem } from '../types';
import StorageManager from './storageManager';

class OfflineSync {
    private static instance: OfflineSync;
    private storage: StorageManager;
    private syncQueue: QueueItem[] = [];
    private syncConfig: SyncConfig;
    private syncInterval: NodeJS.Timeout | null = null;
    private networkStatus: NetworkStatus = { isConnected: false };

    private constructor() {
        this.storage = StorageManager.getInstance();
        this.syncConfig = {
            syncInterval: 5000, // 5 seconds
            retryAttempts: 3
        };
        this.initializeNetworkListener();
    }

    static getInstance(): OfflineSync {
        if (!OfflineSync.instance) {
            OfflineSync.instance = new OfflineSync();
        }
        return OfflineSync.instance;
    }

    public configure(config: SyncConfig) {
        this.syncConfig = { ...this.syncConfig, ...config };
        this.startSyncInterval();
    }

    private async initializeNetworkListener() {
        NetInfo.addEventListener(state => {
            const wasOffline = !this.networkStatus.isConnected;
            this.networkStatus.isConnected = state.isConnected ?? false;

            if (wasOffline && state.isConnected) {
                this.syncQueuedItems();
            }
        });
    }

    private startSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        this.syncInterval = setInterval(() => {
            if (this.networkStatus.isConnected) {
                this.syncQueuedItems();
            }
        }, this.syncConfig.syncInterval);
    }

    public async queueOperation(operation: QueueItem) {
        this.syncQueue.push(operation);
        await this.storage.setItem('__syncQueue', this.syncQueue);

        if (this.networkStatus.isConnected) {
            await this.syncQueuedItems();
        }
    }

    public async syncQueuedItems() {
        if (this.syncQueue.length === 0) return;

        let retryCount = 0;
        let success = false;

        while (retryCount < (this.syncConfig.retryAttempts || 3) && !success) {
            try {
                // Process each queued item
                for (const item of this.syncQueue) {
                    await this.processSyncItem(item);
                }

                // Clear queue after successful sync
                this.syncQueue = [];
                await this.storage.setItem('__syncQueue', this.syncQueue);

                success = true;
                this.networkStatus.lastSyncTime = Date.now();

                if (this.syncConfig.onSyncComplete) {
                    this.syncConfig.onSyncComplete(true);
                }
            } catch (error) {
                retryCount++;
                if (retryCount === this.syncConfig.retryAttempts && this.syncConfig.onSyncError) {
                    this.syncConfig.onSyncError(error as Error);
                }
            }
        }
    }

    private async processSyncItem(item: QueueItem) {
        // Implement your sync logic here
        // This is where you'd make API calls to your backend
        switch (item.operation) {
            case 'set':
                // await yourApi.set(item.key, item.value);
                break;
            case 'remove':
                // await yourApi.remove(item.key);
                break;
        }
    }

    public async getLastSyncTime(): Promise<number | undefined> {
        return this.networkStatus.lastSyncTime;
    }

    public async getPendingOperations(): Promise<QueueItem[]> {
        return [...this.syncQueue];
    }

    public stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
}

export default OfflineSync;