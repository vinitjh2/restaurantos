/**
 * RestaurantOS Native SQLite Offline Adapter
 * Schema definitions and synchronization adapter for Electron Windows desktop
 * and Android/Capacitor POS installations where local SQLite is utilized.
 */

export const SQLITE_OFFLINE_SCHEMA = `
CREATE TABLE IF NOT EXISTS local_sync_operations (
  uuid TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  user_id TEXT,
  operation_type TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  payload TEXT NOT NULL,
  sync_status TEXT DEFAULT 'PENDING',
  retry_count INTEGER DEFAULT 0,
  next_retry_at INTEGER,
  sync_error TEXT,
  server_ack_timestamp INTEGER,
  server_order_id TEXT,
  server_invoice_number TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS local_offline_orders (
  offline_sync_id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  user_id TEXT,
  order_number TEXT NOT NULL,
  local_receipt_number TEXT NOT NULL,
  order_type TEXT NOT NULL,
  table_number TEXT,
  items_json TEXT NOT NULL,
  subtotal REAL NOT NULL,
  tax_amount REAL NOT NULL,
  grand_total REAL NOT NULL,
  is_settled INTEGER DEFAULT 0,
  payment_json TEXT,
  sync_status TEXT DEFAULT 'PENDING',
  retry_count INTEGER DEFAULT 0,
  server_order_id TEXT,
  server_invoice_number TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS local_cached_catalog (
  key TEXT PRIMARY KEY,
  data_json TEXT NOT NULL,
  cached_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS local_cached_sessions (
  email TEXT PRIMARY KEY,
  session_json TEXT NOT NULL,
  cached_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ops_sync_status ON local_sync_operations(sync_status);
CREATE INDEX IF NOT EXISTS idx_orders_sync_status ON local_offline_orders(sync_status);
`;

export interface SqliteSyncAdapter {
  isAvailable(): boolean;
  execute(query: string, params?: any[]): Promise<any>;
  query<T = any>(query: string, params?: any[]): Promise<T[]>;
}

class SqliteOfflineStorageManager {
  private adapter: SqliteSyncAdapter | null = null;

  setAdapter(adapter: SqliteSyncAdapter) {
    this.adapter = adapter;
    this.initSchema();
  }

  private async initSchema() {
    if (!this.adapter || !this.adapter.isAvailable()) return;
    try {
      const statements = SQLITE_OFFLINE_SCHEMA.split(';').filter((s) => s.trim().length > 0);
      for (const statement of statements) {
        await this.adapter.execute(statement);
      }
      console.log('[Native SQLite] Offline schema initialized successfully.');
    } catch (err) {
      console.error('[Native SQLite] Failed to initialize offline schema:', err);
    }
  }

  async saveOperation(op: any): Promise<void> {
    if (!this.adapter || !this.adapter.isAvailable()) return;
    const query = `
      INSERT OR REPLACE INTO local_sync_operations (
        uuid, device_id, tenant_id, branch_id, user_id, operation_type,
        timestamp, payload, sync_status, retry_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.adapter.execute(query, [
      op.uuid,
      op.deviceId,
      op.tenantId,
      op.branchId,
      op.userId,
      op.operationType,
      op.timestamp,
      JSON.stringify(op.payload),
      op.syncStatus,
      op.retryCount || 0,
    ]);
  }

  async getPendingOperations(): Promise<any[]> {
    if (!this.adapter || !this.adapter.isAvailable()) return [];
    const query = `SELECT * FROM local_sync_operations WHERE sync_status IN ('PENDING', 'FAILED') ORDER BY timestamp ASC`;
    return this.adapter.query(query);
  }
}

export const sqliteOfflineStorage = new SqliteOfflineStorageManager();
