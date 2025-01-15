# @shaaz/rn-storage

A powerful and flexible storage solution for React Native applications with built-in support for encryption, caching, and offline synchronization.

## Features

- 🔒 Secure data encryption
- 📦 Efficient caching system
- 🔄 Offline data synchronization
- ⚡ High-performance storage
- 🎯 TypeScript support
- ✨ React Hooks for easy integration

## Installation

```bash
npm install @shaaz/rn-storage

# Required peer dependencies
npm install @react-native-async-storage/async-storage @react-native-community/netinfo
```

## Basic Usage

```typescript
import { StorageManager, useStorage } from '@shaaz/rn-storage';

// Initialize the storage (do this in your app's entry point)
StorageManager.initialize('your-secure-key');

// Use in your components
function MyComponent() {
  const { value, setValue, loading } = useStorage('my-key', initialValue);
  
  return (
    <View>
      {loading ? <ActivityIndicator /> : <Text>{value}</Text>}
    </View>
  );
}
```

## Available Hooks

### 1. useStorage
General-purpose storage hook with all features.

```typescript
const { 
  value, 
  setValue, 
  remove, 
  loading, 
  error 
} = useStorage(key, initialValue, {
  encrypt: true,
  cache: true,
  sync: true,
  expiryTime: 3600000 // 1 hour
});
```

### 2. useCache
Specialized hook for caching with automatic cleanup.

```typescript
const { 
  value, 
  setCache, 
  removeFromCache, 
  clearCache 
} = useCache(key, initialValue, {
  expiryTime: 3600000,
  encryptData: false
});
```

### 3. useEncryptedStorage
Hook specifically for handling encrypted data.

```typescript
const { 
  value, 
  setValue, 
  remove 
} = useEncryptedStorage(key, initialValue);
```

### 4. useOfflineSync
Hook for managing offline data synchronization.

```typescript
const { 
  syncStatus, 
  lastSyncTime, 
  pendingOperations, 
  queueOperation, 
  forceSync 
} = useOfflineSync({
  syncInterval: 5000,
  retryAttempts: 3,
  onSyncComplete: (success) => console.log('Sync completed:', success),
  onSyncError: (error) => console.error('Sync failed:', error)
});
```

## Advanced Usage

### Custom Encryption
```typescript
import { StorageManager, Encryption } from '@shaaz/rn-storage';

// Initialize with a strong encryption key
StorageManager.initialize('your-secure-encryption-key');

// Store encrypted data
await StorageManager.getInstance().setItem('secure-key', sensitiveData, true);
```

### Caching with Size Limits
```typescript
import { CacheManager } from '@shaaz/rn-storage';

const cache = CacheManager.getInstance({
  maxSize: 100, // Maximum items in cache
  expiryTime: 1000 * 60 * 60, // 1 hour
  encryptData: true
});

await cache.set('key', data);
```

### Offline Sync Configuration
```typescript
import { OfflineSync } from '@shaaz/rn-storage';

const sync = OfflineSync.getInstance();

sync.configure({
  syncInterval: 5000, // Sync every 5 seconds
  retryAttempts: 3,
  onSyncComplete: (success) => {
    console.log('Sync status:', success);
  },
  onSyncError: (error) => {
    console.error('Sync failed:', error);
  }
});
```

## API Reference

### StorageManager
- `initialize(key: string)`: Initialize storage with encryption key
- `getInstance()`: Get storage instance
- `setItem(key: string, value: any, encrypt?: boolean)`: Store data
- `getItem(key: string, decrypt?: boolean)`: Retrieve data
- `removeItem(key: string)`: Remove data
- `clear()`: Clear all data

### CacheManager
- `getInstance(config?: CacheConfig)`: Get cache instance
- `set(key: string, value: any, expiryTime?: number)`: Cache data
- `get(key: string)`: Get cached data
- `remove(key: string)`: Remove from cache
- `clear()`: Clear cache

### OfflineSync
- `getInstance()`: Get sync instance
- `configure(config: SyncConfig)`: Configure sync
- `queueOperation(operation: QueueItem)`: Queue operation for sync
- `syncQueuedItems()`: Force sync
- `stopSync()`: Stop sync process

## TypeScript Support

The package includes full TypeScript definitions. Example with custom types:

```typescript
interface UserData {
  id: number;
  name: string;
}

const { value, setValue } = useStorage<UserData>('user', {
  id: 0,
  name: ''
});
```

## Error Handling

All hooks provide error states and handling:

```typescript
const { error, value, setValue } = useStorage('key', initialValue);

if (error) {
  console.error('Storage error:', error.message);
}
```

## Best Practices

1. Initialize early in your app:
```typescript
// App.tsx or index.js
StorageManager.initialize('your-secure-key');
```

2. Handle loading states:
```typescript
const { value, loading } = useStorage('key', null);

if (loading) {
  return <LoadingSpinner />;
}
```

3. Use encryption for sensitive data:
```typescript
const { value } = useEncryptedStorage('api-token', null);
```

4. Configure cache expiry appropriately:
```typescript
const { value } = useCache('user-preferences', null, {
  expiryTime: 1000 * 60 * 60 * 24 // 24 hours
});
```

## License

MIT