/**
 * RestaurantOS Robust Synchronization Queue Manager
 * Manages reliable offline-to-online reconciliation with exponential backoff,
 * duplicate detection, persistent operation queue, and real-time state broadcasts.
 */

import {
  offlineStorage,
  type OfflineOrder,
  type SyncOperationItem,
} from './offline-storage';

export interface SyncStats {
  isOnline: boolean;
  pendingCount: number;
  syncing: boolean;
  lastSyncTime: number | null;
  conflictCount: number;
  failedCount: number;
  syncedCount: number;
  deviceId: string;
}

type SyncListener = (stats: SyncStats) => void;

class SyncQueueManager {
  private isBrowser = typeof window !== 'undefined';
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private lastSyncTime: number | null = null;
  private simulatedOffline = false;

  constructor() {
    if (this.isBrowser) {
      window.addEventListener('online', () => {
        if (!this.simulatedOffline) {
          this.broadcastState();
          this.processQueue();
        }
      });
      window.addEventListener('offline', () => {
        this.broadcastState();
      });

      // Periodic queue reconciliation loop every 10 seconds
      this.intervalTimer = setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          this.processQueue();
        }
      }, 10000);
    }
  }

  get isOnline(): boolean {
    if (this.simulatedOffline) return false;
    if (!this.isBrowser) return true;
    return navigator.onLine;
  }

  setSimulatedOffline(offline: boolean) {
    this.simulatedOffline = offline;
    this.broadcastState();
    if (!offline) {
      this.processQueue();
    }
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.getStats().then((stats) => listener(stats));
    return () => this.listeners.delete(listener);
  }

  async getStats(): Promise<SyncStats> {
    const [orders, operations] = await Promise.all([
      offlineStorage.getAllOrders(),
      offlineStorage.getAllOperations(),
    ]);

    const pending = operations.filter((o) => o.syncStatus === 'PENDING').length +
      orders.filter((o) => o.syncStatus === 'PENDING').length;
    const conflicts = operations.filter((o) => o.syncStatus === 'CONFLICT').length +
      orders.filter((o) => o.syncStatus === 'CONFLICT').length;
    const failed = operations.filter((o) => o.syncStatus === 'FAILED').length +
      orders.filter((o) => o.syncStatus === 'FAILED').length;
    const synced = operations.filter((o) => o.syncStatus === 'SYNCED').length +
      orders.filter((o) => o.syncStatus === 'SYNCED').length;

    return {
      isOnline: this.isOnline,
      pendingCount: pending,
      syncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      conflictCount: conflicts,
      failedCount: failed,
      syncedCount: synced,
      deviceId: offlineStorage.getDeviceId(),
    };
  }

  private async broadcastState() {
    const stats = await this.getStats();
    for (const listener of this.listeners) {
      try {
        listener(stats);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    }
  }

  /**
   * Enqueues a persistent operation item and triggers sync if online
   */
  async enqueueOperation(
    type: SyncOperationItem['operationType'],
    payload: any,
    tenantId: string,
    branchId: string,
    userId: string
  ): Promise<SyncOperationItem> {
    const op: SyncOperationItem = {
      uuid: payload.offlineSyncId || `OP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      deviceId: offlineStorage.getDeviceId(),
      tenantId: tenantId || 'org-default',
      branchId: branchId || 'IND',
      userId: userId || 'staff-offline',
      operationType: type,
      timestamp: Date.now(),
      payload,
      syncStatus: 'PENDING',
      retryCount: 0,
    };

    await offlineStorage.enqueueOperation(op);
    await this.broadcastState();

    if (this.isOnline) {
      this.processQueue();
    }

    return op;
  }

  /**
   * Primary synchronization execution loop
   */
  async processQueue(): Promise<void> {
    if (!this.isBrowser || !this.isOnline || this.isSyncing) {
      return;
    }

    const [pendingOrders, pendingOps] = await Promise.all([
      offlineStorage.getPendingOrders(),
      offlineStorage.getPendingOperations(),
    ]);

    if (pendingOrders.length === 0 && pendingOps.length === 0) {
      return;
    }

    this.isSyncing = true;
    await this.broadcastState();

    const now = Date.now();

    // 1. Process Operations Queue
    for (const op of pendingOps) {
      if (op.nextRetryAt && op.nextRetryAt > now) continue;

      try {
        await offlineStorage.updateOperationStatus(op.uuid, 'SYNCING');

        const res = await fetch('/api/pos/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operationId: op.uuid,
            deviceId: op.deviceId,
            tenantId: op.tenantId,
            branchId: op.branchId,
            userId: op.userId,
            operationType: op.operationType,
            clientTimestamp: op.timestamp,
            ...op.payload,
          }),
        });

        const data = await res.json();

        if (res.ok && (data.success || data.status === 'ALREADY_SYNCED')) {
          await offlineStorage.updateOperationStatus(op.uuid, 'SYNCED', {
            serverAckTimestamp: Date.now(),
            serverOrderId: data.serverOrderId || data.orderId,
            serverInvoiceNumber: data.serverInvoiceNumber || data.invoiceNumber,
          });
        } else if (res.status === 409) {
          await offlineStorage.updateOperationStatus(op.uuid, 'CONFLICT', {
            syncError: data.error || 'Server detected conflict',
          });
        } else {
          const nextRetry = (op.retryCount || 0) + 1;
          const backoff = Math.min(60000, 1000 * Math.pow(2, nextRetry));
          await offlineStorage.updateOperationStatus(op.uuid, 'FAILED', {
            syncError: data.error || 'Server error',
            retryCount: nextRetry,
            nextRetryAt: Date.now() + backoff,
          });
        }
      } catch (err: any) {
        const nextRetry = (op.retryCount || 0) + 1;
        const backoff = Math.min(60000, 1000 * Math.pow(2, nextRetry));
        await offlineStorage.updateOperationStatus(op.uuid, 'FAILED', {
          syncError: err.message || 'Network disconnected',
          retryCount: nextRetry,
          nextRetryAt: Date.now() + backoff,
        });
        break; // Stop loop on network disconnect
      }
    }

    // 2. Process Orders Queue
    for (const order of pendingOrders) {
      if (order.nextRetryAt && order.nextRetryAt > now) continue;

      try {
        await offlineStorage.updateOrderStatus(order.offlineSyncId, 'SYNCING');

        const res = await fetch('/api/pos/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...order,
            deviceId: offlineStorage.getDeviceId(),
          }),
        });

        const data = await res.json();

        if (res.ok && (data.success || data.status === 'ALREADY_SYNCED')) {
          await offlineStorage.updateOrderStatus(order.offlineSyncId, 'SYNCED', {
            serverOrderId: data.serverOrderId || data.orderId,
            serverInvoiceNumber: data.serverInvoiceNumber || data.invoiceNumber,
            retryCount: order.retryCount,
          });
        } else if (res.status === 409) {
          await offlineStorage.updateOrderStatus(order.offlineSyncId, 'CONFLICT', {
            syncError: data.error || 'Sequence conflict',
          });
        } else {
          const nextRetry = (order.retryCount || 0) + 1;
          const backoff = Math.min(60000, 1000 * Math.pow(2, nextRetry));
          await offlineStorage.updateOrderStatus(order.offlineSyncId, 'FAILED', {
            syncError: data.error || 'Sync rejected',
            retryCount: nextRetry,
            nextRetryAt: Date.now() + backoff,
          });
        }
      } catch (err: any) {
        const nextRetry = (order.retryCount || 0) + 1;
        const backoff = Math.min(60000, 1000 * Math.pow(2, nextRetry));
        await offlineStorage.updateOrderStatus(order.offlineSyncId, 'FAILED', {
          syncError: err.message || 'Network disconnected',
          retryCount: nextRetry,
          nextRetryAt: Date.now() + backoff,
        });
        break;
      }
    }

    this.isSyncing = false;
    this.lastSyncTime = Date.now();
    await this.broadcastState();
  }

  async triggerImmediateSync(): Promise<SyncStats> {
    await this.processQueue();
    return this.getStats();
  }
}

export const syncQueue = new SyncQueueManager();
