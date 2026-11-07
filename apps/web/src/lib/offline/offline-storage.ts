/**
 * RestaurantOS Robust Offline Storage Engine
 * Persistent local storage using IndexedDB with fallback to localStorage.
 * Ensures POS operations, catalog lookups, offline login, and local order history
 * continue seamlessly with zero internet connectivity.
 */

export interface SyncOperationItem {
  uuid: string; // Operation UUID
  deviceId: string; // Unique client device identifier
  tenantId: string; // Organization ID
  branchId: string; // Branch ID / Code
  userId: string; // Staff ID / Email who created the operation
  operationType:
    | 'CREATE_ORDER'
    | 'UPDATE_ORDER'
    | 'RECORD_OFFLINE_PAYMENT'
    | 'HOLD_ORDER'
    | 'CANCEL_ORDER';
  timestamp: number; // Client timestamp
  payload: any; // Full operation payload
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'CONFLICT' | 'FAILED';
  retryCount: number;
  nextRetryAt?: number;
  syncError?: string;
  serverAckTimestamp?: number;
  serverOrderId?: string;
  serverInvoiceNumber?: string;
}

export interface OfflineOrderItem {
  menuItemId: string;
  itemName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  modifierTotal: number;
  discountAmount: number;
  discountReason?: string;
  subtotal: number;
  taxAmount: number;
  cookingNotes?: string;
  modifiers?: Array<{
    modifierOptionId: string;
    modifierName: string;
    price: number;
  }>;
}

export interface OfflinePayment {
  method: 'CASH' | 'UPI' | 'CARD';
  amount: number;
  transactionRef?: string;
  notes?: string;
  status: 'PENDING_RECONCILIATION' | 'UNVERIFIED' | 'SETTLED';
}

export interface OfflineOrder {
  offlineSyncId: string; // Unique client idempotency key (UUID)
  clientTimestamp: number;
  deviceId: string;
  tenantId: string;
  branchId: string;
  userId: string;
  orderNumber: string; // e.g. "OFFLINE-IND-1001"
  localReceiptNumber: string; // e.g. "OFF-REC-IND-1793980-X9A"
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'PICKUP';
  tableNumber?: string;
  guestCount: number;
  customerName?: string;
  customerPhone?: string;
  customerGstin?: string;
  customerAddress?: string;
  items: OfflineOrderItem[];
  subtotal: number;
  taxAmount: number;
  billDiscount: number;
  packagingCharge: number;
  deliveryCharge: number;
  serviceCharge: number;
  grandTotal: number;
  isSettled: boolean;
  payment?: OfflinePayment;
  // Sync state
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'CONFLICT' | 'FAILED';
  retryCount: number;
  lastAttemptAt?: number;
  nextRetryAt?: number;
  syncError?: string;
  serverOrderId?: string;
  serverInvoiceNumber?: string;
}

export interface CachedUserSession {
  email: string;
  name: string;
  role: string;
  organizationId: string;
  organizationSlug: string;
  assignedBranchId?: string | null;
  token?: string;
  pinHash?: string;
  cachedAt: number;
}

const DB_NAME = 'RestaurantOS_OfflineDB';
const DB_VERSION = 2; // Upgraded for sync_operations and cached_sessions
const ORDERS_STORE = 'offline_orders';
const OPERATIONS_STORE = 'sync_operations';
const CATALOG_STORE = 'cached_catalog';
const SESSIONS_STORE = 'cached_sessions';
const TABLES_STORE = 'cached_tables';

class OfflineStorageEngine {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isBrowser = typeof window !== 'undefined';
  private cachedDeviceId: string | null = null;

  constructor() {
    if (this.isBrowser && 'indexedDB' in window) {
      this.initIndexedDB();
    }
  }

  /**
   * Returns a persistent unique device identifier
   */
  getDeviceId(): string {
    if (this.cachedDeviceId) return this.cachedDeviceId;

    if (this.isBrowser) {
      let storedId = localStorage.getItem('restaurantos_device_id');
      if (!storedId) {
        storedId = `POS-DEV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        localStorage.setItem('restaurantos_device_id', storedId);
      }
      this.cachedDeviceId = storedId;
      return storedId;
    }
    return 'POS-DEV-SRV';
  }

  private initIndexedDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!this.isBrowser || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Offline Orders Store
        if (!db.objectStoreNames.contains(ORDERS_STORE)) {
          const store = db.createObjectStore(ORDERS_STORE, { keyPath: 'offlineSyncId' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('clientTimestamp', 'clientTimestamp', { unique: false });
        }

        // 2. Persistent Sync Operations Queue Store
        if (!db.objectStoreNames.contains(OPERATIONS_STORE)) {
          const store = db.createObjectStore(OPERATIONS_STORE, { keyPath: 'uuid' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 3. Cached Catalog Store
        if (!db.objectStoreNames.contains(CATALOG_STORE)) {
          db.createObjectStore(CATALOG_STORE, { keyPath: 'key' });
        }

        // 4. Cached Authorized Sessions Store (for Offline Login)
        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          db.createObjectStore(SESSIONS_STORE, { keyPath: 'email' });
        }

        // 5. Cached Tables Store
        if (!db.objectStoreNames.contains(TABLES_STORE)) {
          db.createObjectStore(TABLES_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // =========================================================================
  // PERSISTENT OPERATION QUEUE (UUID, DeviceId, TenantId, BranchId, UserId)
  // =========================================================================

  async enqueueOperation(op: SyncOperationItem): Promise<void> {
    if (!this.isBrowser) return;

    try {
      const db = await this.initIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(OPERATIONS_STORE, 'readwrite');
        const store = tx.objectStore(OPERATIONS_STORE);
        const req = store.put(op);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.saveOperationToLocalStorage(op);
    }
  }

  async getAllOperations(): Promise<SyncOperationItem[]> {
    if (!this.isBrowser) return [];

    try {
      const db = await this.initIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(OPERATIONS_STORE, 'readonly');
        const store = tx.objectStore(OPERATIONS_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getAllOperationsFromLocalStorage();
    }
  }

  async getPendingOperations(): Promise<SyncOperationItem[]> {
    const all = await this.getAllOperations();
    return all.filter((o) => o.syncStatus === 'PENDING' || o.syncStatus === 'FAILED');
  }

  async updateOperationStatus(
    uuid: string,
    status: SyncOperationItem['syncStatus'],
    meta?: {
      syncError?: string;
      retryCount?: number;
      nextRetryAt?: number;
      serverAckTimestamp?: number;
      serverOrderId?: string;
      serverInvoiceNumber?: string;
    }
  ): Promise<void> {
    const all = await this.getAllOperations();
    const op = all.find((o) => o.uuid === uuid);
    if (!op) return;

    op.syncStatus = status;
    if (meta?.syncError !== undefined) op.syncError = meta.syncError;
    if (meta?.retryCount !== undefined) op.retryCount = meta.retryCount;
    if (meta?.nextRetryAt !== undefined) op.nextRetryAt = meta.nextRetryAt;
    if (meta?.serverAckTimestamp !== undefined) op.serverAckTimestamp = meta.serverAckTimestamp;
    if (meta?.serverOrderId !== undefined) op.serverOrderId = meta.serverOrderId;
    if (meta?.serverInvoiceNumber !== undefined) op.serverInvoiceNumber = meta.serverInvoiceNumber;

    await this.enqueueOperation(op);
  }

  async clearSyncedOperations(): Promise<void> {
    const all = await this.getAllOperations();
    const syncedIds = all.filter((o) => o.syncStatus === 'SYNCED').map((o) => o.uuid);

    try {
      const db = await this.initIndexedDB();
      const tx = db.transaction(OPERATIONS_STORE, 'readwrite');
      const store = tx.objectStore(OPERATIONS_STORE);
      for (const id of syncedIds) {
        store.delete(id);
      }
    } catch {
      const remaining = all.filter((o) => o.syncStatus !== 'SYNCED');
      localStorage.setItem('restaurantos_sync_operations', JSON.stringify(remaining));
    }
  }

  // =========================================================================
  // OFFLINE ORDERS PERSISTENCE
  // =========================================================================

  async saveOrder(order: OfflineOrder): Promise<void> {
    if (!this.isBrowser) return;

    try {
      const db = await this.initIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ORDERS_STORE, 'readwrite');
        const store = tx.objectStore(ORDERS_STORE);
        const req = store.put(order);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.saveOrderToLocalStorage(order);
    }
  }

  async getOrder(offlineSyncId: string): Promise<OfflineOrder | null> {
    if (!this.isBrowser) return null;

    try {
      const db = await this.initIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ORDERS_STORE, 'readonly');
        const store = tx.objectStore(ORDERS_STORE);
        const req = store.get(offlineSyncId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getOrderFromLocalStorage(offlineSyncId);
    }
  }

  async getAllOrders(): Promise<OfflineOrder[]> {
    if (!this.isBrowser) return [];

    try {
      const db = await this.initIndexedDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ORDERS_STORE, 'readonly');
        const store = tx.objectStore(ORDERS_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getAllOrdersFromLocalStorage();
    }
  }

  async getPendingOrders(): Promise<OfflineOrder[]> {
    const all = await this.getAllOrders();
    return all.filter((o) => o.syncStatus === 'PENDING' || o.syncStatus === 'FAILED');
  }

  async updateOrderStatus(
    offlineSyncId: string,
    status: OfflineOrder['syncStatus'],
    metadata?: {
      serverOrderId?: string;
      serverInvoiceNumber?: string;
      syncError?: string;
      retryCount?: number;
      nextRetryAt?: number;
    }
  ): Promise<void> {
    const order = await this.getOrder(offlineSyncId);
    if (!order) return;

    order.syncStatus = status;
    order.lastAttemptAt = Date.now();
    if (metadata?.serverOrderId) order.serverOrderId = metadata.serverOrderId;
    if (metadata?.serverInvoiceNumber) order.serverInvoiceNumber = metadata.serverInvoiceNumber;
    if (metadata?.syncError !== undefined) order.syncError = metadata.syncError;
    if (metadata?.retryCount !== undefined) order.retryCount = metadata.retryCount;
    if (metadata?.nextRetryAt !== undefined) order.nextRetryAt = metadata.nextRetryAt;

    await this.saveOrder(order);
  }

  // =========================================================================
  // OFFLINE LOGIN & SESSION CACHING
  // =========================================================================

  async cacheSession(session: CachedUserSession): Promise<void> {
    if (!this.isBrowser) return;

    try {
      const db = await this.initIndexedDB();
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      tx.objectStore(SESSIONS_STORE).put(session);
    } catch {
      localStorage.setItem(`restaurantos_session_${session.email}`, JSON.stringify(session));
    }
    // Also keep a primary active offline session reference
    localStorage.setItem('restaurantos_active_offline_session', JSON.stringify(session));
  }

  async getCachedSession(email?: string): Promise<CachedUserSession | null> {
    if (!this.isBrowser) return null;

    if (email) {
      try {
        const db = await this.initIndexedDB();
        return new Promise((resolve) => {
          const tx = db.transaction(SESSIONS_STORE, 'readonly');
          const req = tx.objectStore(SESSIONS_STORE).get(email);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
      } catch {
        const raw = localStorage.getItem(`restaurantos_session_${email}`);
        return raw ? JSON.parse(raw) : null;
      }
    }

    // Return last active session if no email specified
    const activeRaw = localStorage.getItem('restaurantos_active_offline_session');
    return activeRaw ? JSON.parse(activeRaw) : null;
  }

  async getActiveOfflineSession(): Promise<CachedUserSession | null> {
    return this.getCachedSession();
  }

  // =========================================================================
  // CATALOG & DINING TABLE CACHING
  // =========================================================================

  async cacheCatalog(key: string, data: unknown): Promise<void> {
    if (!this.isBrowser) return;
    try {
      const db = await this.initIndexedDB();
      const tx = db.transaction(CATALOG_STORE, 'readwrite');
      tx.objectStore(CATALOG_STORE).put({ key, data, cachedAt: Date.now() });
    } catch {
      localStorage.setItem(`restaurantos_cache_${key}`, JSON.stringify(data));
    }
  }

  async getCachedCatalog<T>(key: string): Promise<T | null> {
    if (!this.isBrowser) return null;
    try {
      const db = await this.initIndexedDB();
      return new Promise((resolve) => {
        const tx = db.transaction(CATALOG_STORE, 'readonly');
        const req = tx.objectStore(CATALOG_STORE).get(key);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      const raw = localStorage.getItem(`restaurantos_cache_${key}`);
      return raw ? JSON.parse(raw) : null;
    }
  }

  // =========================================================================
  // LOCALSTORAGE FALLBACK IMPLEMENTATIONS
  // =========================================================================

  private saveOperationToLocalStorage(op: SyncOperationItem) {
    const ops = this.getAllOperationsFromLocalStorage();
    const idx = ops.findIndex((o) => o.uuid === op.uuid);
    if (idx >= 0) {
      ops[idx] = op;
    } else {
      ops.push(op);
    }
    localStorage.setItem('restaurantos_sync_operations', JSON.stringify(ops));
  }

  private getAllOperationsFromLocalStorage(): SyncOperationItem[] {
    try {
      const raw = localStorage.getItem('restaurantos_sync_operations');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveOrderToLocalStorage(order: OfflineOrder) {
    const orders = this.getAllOrdersFromLocalStorage();
    const idx = orders.findIndex((o) => o.offlineSyncId === order.offlineSyncId);
    if (idx >= 0) {
      orders[idx] = order;
    } else {
      orders.push(order);
    }
    localStorage.setItem('restaurantos_offline_orders', JSON.stringify(orders));
  }

  private getOrderFromLocalStorage(id: string): OfflineOrder | null {
    const orders = this.getAllOrdersFromLocalStorage();
    return orders.find((o) => o.offlineSyncId === id) || null;
  }

  private getAllOrdersFromLocalStorage(): OfflineOrder[] {
    try {
      const raw = localStorage.getItem('restaurantos_offline_orders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const offlineStorage = new OfflineStorageEngine();

/**
 * Generates an idempotent, conflict-free offline order sync ID
 */
export function generateOfflineSyncId(branchCode = 'IND'): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `OFF-${branchCode}-${ts}-${rand}`;
}

/**
 * Generates an offline pre-invoice receipt number
 */
export function generateOfflineReceiptNumber(branchCode = 'IND'): string {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `OFF-REC-${branchCode}-${ts}-${rand}`;
}
