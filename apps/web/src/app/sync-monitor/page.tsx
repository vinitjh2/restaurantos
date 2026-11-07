"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Play,
  Terminal,
  Zap,
  Check,
  X,
  FileText,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { syncQueue, SyncStats } from "@/lib/offline/sync-queue";
import {
  offlineStorage,
  SyncOperationItem,
  OfflineOrder,
} from "@/lib/offline/offline-storage";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServerSyncOp {
  id: string;
  operationId: string;
  deviceId: string;
  tenantId: string;
  branchId: string;
  userId?: string | null;
  operationType: string;
  clientTimestamp: string;
  serverTimestamp: string;
  syncStatus: string;
  conflictReason?: string | null;
  payloadSummary: string;
}

export default function SyncMonitorPage() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [localOps, setLocalOps] = useState<SyncOperationItem[]>([]);
  const [localOrders, setLocalOrders] = useState<OfflineOrder[]>([]);
  const [serverOps, setServerOps] = useState<ServerSyncOp[]>([]);
  const [serverMetrics, setServerMetrics] = useState<any>(null);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncingNow, setSyncingNow] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ServerSyncOp | null>(null);

  const addLog = (msg: string) => {
    setSimulationLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const loadLocalState = async () => {
    const s = await syncQueue.getStats();
    setStats(s);
    const [ops, orders] = await Promise.all([
      offlineStorage.getAllOperations(),
      offlineStorage.getAllOrders(),
    ]);
    setLocalOps(ops);
    setLocalOrders(orders);
  };

  const loadServerState = async () => {
    try {
      const res = await fetch("/api/pos/sync/monitor");
      const json = await res.json();
      if (json.success) {
        setServerOps(json.operations || []);
        setServerMetrics(json.metrics || null);
      }
    } catch (err) {
      console.warn("Could not reach server sync monitor (might be offline):", err);
    }
  };

  useEffect(() => {
    const unsubscribe = syncQueue.subscribe((newStats) => {
      setStats(newStats);
    });

    const refreshAll = async () => {
      setLoading(true);
      await Promise.all([loadLocalState(), loadServerState()]);
      setLoading(false);
    };

    refreshAll();

    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    try {
      setSyncingNow(true);
      addLog("Manual synchronization cycle triggered.");
      await syncQueue.triggerImmediateSync();
      await Promise.all([loadLocalState(), loadServerState()]);
      addLog("Synchronization cycle complete.");
    } catch (err: any) {
      addLog(`Sync error: ${err.message}`);
    } finally {
      setSyncingNow(false);
    }
  };

  const handleToggleOfflineSimulator = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    syncQueue.setSimulatedOffline(nextState);
    addLog(nextState ? "SIMULATED: Network disconnected! Offline mode active." : "SIMULATED: Network restored! Auto-reconciliation active.");
  };

  const handleCreateTestOfflineOrder = async () => {
    const testOrderId = `OFF-TEST-${Date.now().toString().slice(-4)}`;
    const testOrder: OfflineOrder = {
      offlineSyncId: `OFF-IND-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      clientTimestamp: Date.now(),
      deviceId: offlineStorage.getDeviceId(),
      tenantId: "org-bawarchi",
      branchId: "IND",
      userId: "staff-vikram",
      orderNumber: testOrderId,
      localReceiptNumber: `OFF-REC-IND-${Date.now().toString().slice(-5)}`,
      orderType: "DINE_IN",
      tableNumber: "T-04",
      guestCount: 2,
      customerName: "Offline Guest",
      items: [
        {
          menuItemId: "item-paneer-01",
          itemName: "Paneer Butter Masala",
          quantity: 2,
          unitPrice: 320.0,
          modifierTotal: 0,
          discountAmount: 0,
          subtotal: 640.0,
          taxAmount: 32.0,
        },
      ],
      subtotal: 640.0,
      taxAmount: 32.0,
      billDiscount: 0,
      packagingCharge: 0,
      deliveryCharge: 0,
      serviceCharge: 0,
      grandTotal: 672.0,
      isSettled: true,
      payment: {
        method: "CASH",
        amount: 672.0,
        status: "PENDING_RECONCILIATION",
      },
      syncStatus: "PENDING",
      retryCount: 0,
    };

    await offlineStorage.saveOrder(testOrder);
    await syncQueue.enqueueOperation("CREATE_ORDER", testOrder, "org-bawarchi", "IND", "staff-vikram");
    await loadLocalState();
    addLog(`Created test offline order #${testOrderId} in local queue.`);
  };

  const handleSimulateDuplicateSend = async () => {
    if (localOps.length === 0) {
      addLog("No local operations to resend. Create a test order first.");
      return;
    }
    const op = localOps[0];
    addLog(`SIMULATED: Resending operation '${op.uuid.slice(0, 16)}...' to test server idempotency.`);
    try {
      const res = await fetch("/api/pos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationId: op.uuid,
          deviceId: op.deviceId,
          tenantId: op.tenantId,
          branchId: op.branchId,
          ...op.payload,
        }),
      });
      const data = await res.json();
      if (data.status === "ALREADY_SYNCED") {
        addLog(`IDEMPOTENCY VERIFIED: Server detected duplicate and safely returned ALREADY_SYNCED (zero double billing).`);
      } else {
        addLog(`Server response: ${data.status || "OK"}`);
      }
    } catch (err: any) {
      addLog(`Send error: ${err.message}`);
    }
  };

  const handleSimulateConflict = async () => {
    addLog("SIMULATED: Device B attempting conflicting update on already invoiced order...");
    try {
      const res = await fetch("/api/pos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationId: `OP-CONFLICT-${Date.now()}`,
          deviceId: "POS-DEV-SECONDARY-02",
          tenantId: "org-bawarchi",
          branchId: "IND",
          userId: "cashier-device-b",
          operationType: "CANCEL_ORDER",
          targetOrderId: "some-paid-order-id",
          items: [],
        }),
      });
      const data = await res.json();
      if (res.status === 409 || data.status === "CONFLICT") {
        addLog("CONFLICT BARRIER ACTIVE: Server rejected conflicting update with HTTP 409 Conflict!");
      } else {
        addLog(`Response: ${data.status || res.status}`);
      }
      await loadServerState();
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <HardDrive className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Offline Sync & Terminal Monitor
            </h1>
            <Badge
              variant={stats?.isOnline ? "success" : "destructive"}
              className="text-[10px] font-bold"
            >
              {stats?.isOnline ? "Cloud Online" : "Offline Mode"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time synchronization telemetry, operation queue inspection, idempotency guards, and conflict resolution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleOfflineSimulator}
            className={`text-xs gap-1.5 ${
              isSimulatedOffline
                ? "bg-rose-50 border-rose-300 text-rose-700 font-bold"
                : "text-slate-700"
            }`}
          >
            {isSimulatedOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
            <span>{isSimulatedOffline ? "Restore Real Network" : "Simulate Offline"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleManualSync}
            disabled={syncingNow || !stats?.isOnline}
            className="bg-slate-900 text-white text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncingNow ? "animate-spin text-emerald-400" : ""}`} />
            <span>{syncingNow ? "Syncing Queue..." : "Sync Queue Now"}</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Terminal Status
          </span>
          <div className="text-xl font-black mt-1 flex items-center gap-1.5 text-slate-900">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                stats?.isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span>{stats?.isOnline ? "Online" : "Offline"}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            {stats?.deviceId || "POS-DEV"}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Local Pending
          </span>
          <div className="text-xl font-black text-amber-600 mt-1">
            {stats?.pendingCount || 0}
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            Operations queued
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Synced Local
          </span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {stats?.syncedCount || 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
            Reconciled to DB
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Conflicts Detected
          </span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {stats?.conflictCount || 0}
          </div>
          <span className="text-[10px] text-rose-700 font-medium mt-1 block">
            Protected from overwrite
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Server Sync Success
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {serverMetrics?.successRate ?? 100}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            Across {serverMetrics?.totalDevices || 1} devices
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Last Sync Time
          </span>
          <div className="text-xs font-bold text-slate-800 mt-2 truncate">
            {stats?.lastSyncTime
              ? new Date(stats.lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "Never"}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Auto-loop 10s</span>
        </div>
      </div>

      {/* Main Workspace (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Local Operation Queue & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Local Operation Queue Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Local Persistent Operation Queue ({localOps.length})
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await offlineStorage.clearSyncedOperations();
                  await loadLocalState();
                  addLog("Cleaned up synced operations from local IndexedDB.");
                }}
                className="h-7 text-xs"
              >
                Clear Synced
              </Button>
            </div>

            {localOps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Local queue is clean. Zero pending operations.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Operation ID</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Device / User</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Retries</th>
                      <th className="py-2.5 px-3 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localOps.map((op) => (
                      <tr key={op.uuid} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {op.uuid.slice(0, 18)}...
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700 text-[10px]">
                            {op.operationType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div>{op.deviceId}</div>
                          <span className="text-[10px] text-slate-400">{op.userId}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            variant={
                              op.syncStatus === "SYNCED"
                                ? "success"
                                : op.syncStatus === "PENDING"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {op.syncStatus}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                          {op.retryCount}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                          {new Date(op.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Server-Side Global Sync Audit Ledger */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Server Synchronization Ledger ({serverOps.length} recent ops)
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] bg-slate-50">
                Idempotency Verified
              </Badge>
            </div>

            {serverOps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No server sync operations recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Operation / Order</th>
                      <th className="py-2.5 px-3">Device Origin</th>
                      <th className="py-2.5 px-3">Outlet</th>
                      <th className="py-2.5 px-3 text-center">Server Status</th>
                      <th className="py-2.5 px-3 text-right">Synced At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serverOps.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block font-mono">
                            {op.operationId.slice(0, 18)}...
                          </span>
                          <span className="text-[10px] text-slate-500">{op.payloadSummary}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {op.deviceId}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-700">
                          {op.branchId}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            variant={op.syncStatus === "SYNCED" ? "success" : "destructive"}
                            className="text-[10px]"
                          >
                            {op.syncStatus}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                          {new Date(op.serverTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Simulation Tools & Live Console */}
        <div className="space-y-6">
          {/* Simulation Tools Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Interactive Test Scenarios
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Simulate real-world restaurant hardware interruptions, network drops, duplicate pushes, and conflicts:
            </p>

            <div className="space-y-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateTestOfflineOrder}
                className="w-full text-xs justify-start gap-2 h-9"
              >
                <Plus className="h-3.5 w-3.5 text-blue-600" />
                <span>1. Queue Offline Order (₹672.00)</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleOfflineSimulator}
                className="w-full text-xs justify-start gap-2 h-9"
              >
                {isSimulatedOffline ? (
                  <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-rose-600" />
                )}
                <span>2. {isSimulatedOffline ? "Restore Internet Reconnect" : "Simulate Internet Drop"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateDuplicateSend}
                className="w-full text-xs justify-start gap-2 h-9"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                <span>3. Send Duplicate Operation (Test Idempotency)</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateConflict}
                className="w-full text-xs justify-start gap-2 h-9"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span>4. Simulate Device B Conflict Update</span>
              </Button>
            </div>
          </div>

          {/* Real-Time Event Log Console */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950 shadow-xs p-5 space-y-3 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Terminal Sync Activity</span>
              </div>
              <button
                onClick={() => setSimulationLog([])}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>

            <div className="font-mono text-[11px] space-y-1.5 min-h-[180px] max-h-[260px] overflow-y-auto">
              {simulationLog.length === 0 ? (
                <div className="text-slate-500 italic py-4 text-center">
                  Listening for offline order creation & sync broadcasts...
                </div>
              ) : (
                simulationLog.map((log, idx) => (
                  <div key={idx} className="text-emerald-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
