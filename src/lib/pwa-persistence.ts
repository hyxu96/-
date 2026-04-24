// PWA 数据持久化管理器
// 确保localStorage数据在PWA环境中正确持久化

export class PWAPersistenceManager {
  private static instance: PWAPersistenceManager;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: Array<{ key: string; value: string; timestamp: number }> = [];

  private constructor() {
    this.initialize();
  }

  static getInstance(): PWAPersistenceManager {
    if (!PWAPersistenceManager.instance) {
      PWAPersistenceManager.instance = new PWAPersistenceManager();
    }
    return PWAPersistenceManager.instance;
  }

  private initialize() {
    // 监听在线状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 监听Service Worker更新
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          // Service Worker缓存更新时，确保数据同步
          this.forceSyncAllData();
        }
      });
    }

    // 监听页面可见性变化，确保数据同步
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncPendingData();
      }
    });

    // 监听页面卸载前的数据保存
    window.addEventListener('beforeunload', () => {
      this.emergencySave();
    });
  }

  // 增强的localStorage设置方法
  setItem(key: string, value: string): void {
    try {
      // 首先尝试设置到localStorage
      localStorage.setItem(key, value);

      // 如果离线，添加到同步队列
      if (!this.isOnline) {
        this.syncQueue.push({
          key,
          value,
          timestamp: Date.now()
        });
      }

      // 同时保存到IndexedDB作为备份
      this.saveToIndexedDB(key, value);

    } catch (error) {
      console.error('PWA Persistence: Failed to save data to localStorage:', error);
      // 如果localStorage失败，尝试使用IndexedDB
      this.saveToIndexedDB(key, value);
    }
  }

  // 增强的localStorage获取方法
  async getItem(key: string): Promise<string | null> {
    try {
      // 首先尝试从localStorage获取
      let value = localStorage.getItem(key);

      // 如果localStorage为空，尝试从IndexedDB恢复
      if (value === null) {
        value = await this.getFromIndexedDB(key);
      }

      return value;
    } catch (error) {
      console.error('PWA Persistence: Failed to get data from localStorage:', error);
      // 如果localStorage失败，尝试从IndexedDB获取
      return await this.getFromIndexedDB(key);
    }
  }

  // 移除数据
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      this.removeFromIndexedDB(key);
    } catch (error) {
      console.error('PWA Persistence: Failed to remove data:', error);
    }
  }

  // 清空所有数据
  clear(): void {
    try {
      localStorage.clear();
      this.clearIndexedDB();
    } catch (error) {
      console.error('PWA Persistence: Failed to clear data:', error);
    }
  }

  // IndexedDB 备份存储
  private async saveToIndexedDB(key: string, value: string): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['pwa-data'], 'readwrite');
      const store = transaction.objectStore('pwa-data');

      await store.put({ key, value, timestamp: Date.now() });
      db.close();
    } catch (error) {
      console.error('PWA Persistence: Failed to save to IndexedDB:', error);
    }
  }

  private async getFromIndexedDB(key: string): Promise<string | null> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['pwa-data'], 'readonly');
      const store = transaction.objectStore('pwa-data');

      const request = store.get(key);
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          db.close();
          resolve(result ? result.value : null);
        };
        request.onerror = () => {
          db.close();
          resolve(null);
        };
      });
    } catch (error) {
      console.error('PWA Persistence: Failed to get from IndexedDB:', error);
      return null;
    }
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['pwa-data'], 'readwrite');
      const store = transaction.objectStore('pwa-data');

      await store.delete(key);
      db.close();
    } catch (error) {
      console.error('PWA Persistence: Failed to remove from IndexedDB:', error);
    }
  }

  private async clearIndexedDB(): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['pwa-data'], 'readwrite');
      const store = transaction.objectStore('pwa-data');

      await store.clear();
      db.close();
    } catch (error) {
      console.error('PWA Persistence: Failed to clear IndexedDB:', error);
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MomoPet-PWA', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pwa-data')) {
          const store = db.createObjectStore('pwa-data', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // 同步待处理数据
  private async syncPendingData(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`PWA Persistence: Syncing ${this.syncQueue.length} pending items...`);

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToSync) {
      try {
        localStorage.setItem(item.key, item.value);
        await this.saveToIndexedDB(item.key, item.value);
      } catch (error) {
        console.error('PWA Persistence: Failed to sync item:', item.key, error);
        // 重新添加到队列
        this.syncQueue.push(item);
      }
    }
  }

  // 强制同步所有数据
  private async forceSyncAllData(): Promise<void> {
    console.log('PWA Persistence: Force syncing all data...');

    try {
      // 从IndexedDB恢复所有数据到localStorage
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['pwa-data'], 'readonly');
      const store = transaction.objectStore('pwa-data');

      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result;
        for (const item of items) {
          try {
            localStorage.setItem(item.key, item.value);
          } catch (error) {
            console.error('PWA Persistence: Failed to restore item:', item.key, error);
          }
        }
        db.close();
      };
    } catch (error) {
      console.error('PWA Persistence: Failed to force sync:', error);
    }
  }

  // 紧急保存（页面卸载前）
  private emergencySave(): void {
    // 确保所有待处理的数据都被保存
    for (const item of this.syncQueue) {
      try {
        localStorage.setItem(item.key, item.value);
      } catch (error) {
        console.error('PWA Persistence: Emergency save failed for:', item.key);
      }
    }
  }

  // 获取存储状态信息
  getStorageInfo(): {
    localStorage: number;
    indexedDB: number;
    isOnline: boolean;
    syncQueueLength: number;
  } {
    let indexedDBCount = 0;

    // 异步获取IndexedDB计数（这里简化处理）
    this.openIndexedDB().then(db => {
      const transaction = db.transaction(['pwa-data'], 'readonly');
      const store = transaction.objectStore('pwa-data');
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        indexedDBCount = countRequest.result;
        db.close();
      };
    });

    return {
      localStorage: localStorage.length,
      indexedDB: indexedDBCount,
      isOnline: this.isOnline,
      syncQueueLength: this.syncQueue.length
    };
  }
}

// 创建全局实例
export const pwaPersistence = PWAPersistenceManager.getInstance();

// 增强的localStorage包装器
export const persistentStorage = {
  setItem: (key: string, value: string) => pwaPersistence.setItem(key, value),
  getItem: (key: string) => pwaPersistence.getItem(key),
  removeItem: (key: string) => pwaPersistence.removeItem(key),
  clear: () => pwaPersistence.clear(),
  getStorageInfo: () => pwaPersistence.getStorageInfo(),
};

// 导出便捷方法
export default persistentStorage;
