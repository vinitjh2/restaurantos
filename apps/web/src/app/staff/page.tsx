"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Shield,
  KeyRound,
  Phone,
  Mail,
  CheckCircle2,
  AlertOctagon,
  X,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  ShieldAlert,
  IndianRupee,
  Layers,
  Sparkles,
  Eye,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALL_ROLES, DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, SystemRole } from "@/lib/server/rbac-engine";

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: SystemRole;
  pinConfigured: boolean;
  hourlyRate: number;
  monthlySalary: number;
  permissions: string;
  isActive: boolean;
  joinedAt: string;
}

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "ROLES" | "PIN_TEST">("DIRECTORY");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Modals
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showPinAuthModal, setShowPinAuthModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CASHIER" as SystemRole,
    pinCode: "",
    monthlySalary: 28000,
    hourlyRate: 0,
  });

  const [pinAuthForm, setPinAuthForm] = useState({
    pinCode: "",
    action: "ORDER_REFUND",
    requiredPermission: "pos:refund",
    details: "Testing supervisor authorization override",
  });
  const [pinAuthResult, setPinAuthResult] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (err: any) {
      console.error("Error loading staff data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Add Staff Member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Staff member created");
        setShowAddStaffModal(false);
        setNewStaff({
          name: "",
          email: "",
          phone: "",
          role: "CASHIER",
          pinCode: "",
          monthlySalary: 28000,
          hourlyRate: 0,
        });
        loadData();
      } else {
        notify("error", data.error || "Failed to add staff");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to add staff");
    } finally {
      setSubmitting(false);
    }
  };

  // Test PIN Authorization
  const handleTestPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setPinAuthResult(null);
    try {
      const res = await fetch("/api/auth/pin-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pinAuthForm),
      });
      const data = await res.json();
      setPinAuthResult(data);
    } catch (err: any) {
      setPinAuthResult({ success: false, authorized: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "All" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertOctagon className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Staff & Access Permissions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control (RBAC), 4-digit quick POS PIN codes, biometric shifts and audit security
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs border-slate-200 hover:bg-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPinAuthModal(true)}
            className="gap-1.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
          >
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            <span>Test PIN Override</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddStaffModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Staff Member</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "DIRECTORY"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Staff Directory ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ROLES")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "ROLES"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Role Permission Matrix (8 Roles)</span>
        </button>
      </div>

      {/* Filter and Search */}
      {activeTab === "DIRECTORY" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff by name, phone or email..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["All", ...ALL_ROLES].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
                  roleFilter === role
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === "DIRECTORY" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Staff Member</th>
                  <th className="py-3 px-4 font-semibold">Enterprise Role</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold text-right">Compensation</th>
                  <th className="py-3 px-4 font-semibold text-center">4-Digit PIN</th>
                  <th className="py-3 px-4 font-semibold text-center">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No staff members match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <span className="text-[10px] text-slate-400">Joined: {new Date(s.joinedAt).toLocaleDateString("en-IN")}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            s.role === "OWNER"
                              ? "bg-purple-50 text-purple-800 border-purple-300"
                              : s.role === "MANAGER"
                              ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                              : s.role === "KITCHEN_STAFF"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : s.role === "ACCOUNTANT"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {s.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{s.phone}</div>
                        {s.email && <div className="text-[11px] text-slate-400">{s.email}</div>}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {s.monthlySalary > 0
                          ? `${formatINR(s.monthlySalary)} / mo`
                          : `₹${s.hourlyRate} / hr`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <KeyRound className="h-3 w-3" />
                          <span>Configured</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success" className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSION MATRIX */}
      {activeTab === "ROLES" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Granular Permissions Across 8 Enterprise Roles</h3>
            <p className="text-xs text-slate-500 mb-4">
              Restricted financial actions (bill discounts, order voids, cash refunds, vendor payments) require authorized supervisor PIN approval.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ALL_ROLES.map((role) => {
                const perms = DEFAULT_ROLE_PERMISSIONS[role] || [];
                return (
                  <div key={role} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{role}</span>
                      <span className="text-[10px] font-mono text-slate-500">{perms.length} Permissions</span>
                    </div>

                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {perms.map((p) => (
                        <div key={p} className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center justify-between">
                          <span>{p}</span>
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STAFF */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span>Register Staff Member</span>
              </h2>
              <button onClick={() => setShowAddStaffModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+91 98800 22334"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">System Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as SystemRole })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">4-Digit Quick POS PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newStaff.pinCode}
                    onChange={(e) => setNewStaff({ ...newStaff, pinCode: e.target.value })}
                    placeholder="e.g. 1234"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono tracking-widest text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="staff@restaurantos.in"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newStaff.monthlySalary}
                    onChange={(e) => setNewStaff({ ...newStaff, monthlySalary: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddStaffModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Saving..." : "Save Staff Member"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TEST PIN AUTH */}
      {showPinAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>Verify Staff PIN & Permissions</span>
                </h2>
                <span className="text-[11px] text-slate-500">Test role-based action authorization</span>
              </div>
              <button onClick={() => setShowPinAuthModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleTestPin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Enter 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pinAuthForm.pinCode}
                  onChange={(e) => setPinAuthForm({ ...pinAuthForm, pinCode: e.target.value })}
                  placeholder="e.g. 1234 (Manager) or 2222 (Cashier)"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-base font-mono tracking-widest text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Action to Authorize</label>
                <select
                  value={pinAuthForm.requiredPermission}
                  onChange={(e) => {
                    setPinAuthForm({
                      ...pinAuthForm,
                      requiredPermission: e.target.value,
                      action: e.target.options[e.target.selectedIndex].text,
                    });
                  }}
                  className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                >
                  <option value="pos:refund">Process Order Refund (pos:refund)</option>
                  <option value="pos:cancel_order">Void / Cancel Settle Bill (pos:cancel_order)</option>
                  <option value="pos:bill_discount">Apply Over 10% Bill Discount (pos:bill_discount)</option>
                  <option value="inventory:adjust_wastage">Write Off Inventory Wastage (inventory:adjust_wastage)</option>
                  <option value="payroll:view">Access Financial Payroll (payroll:view)</option>
                </select>
              </div>

              {pinAuthResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    pinAuthResult.authorized
                      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                      : "bg-rose-50 border-rose-300 text-rose-800"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {pinAuthResult.authorized ? (
                      <>
                        <Unlock className="h-4 w-4 text-emerald-600" />
                        <span>AUTHORIZATION GRANTED</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-rose-600" />
                        <span>ACCESS DENIED</span>
                      </>
                    )}
                  </div>
                  <div>{pinAuthResult.message || pinAuthResult.error}</div>
                  {pinAuthResult.staff && (
                    <div className="mt-1 text-[11px] font-normal text-slate-700">
                      Operator: <span className="font-semibold">{pinAuthResult.staff.name}</span> ({pinAuthResult.staff.role})
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPinAuthModal(false)}>
                  Close
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Verifying..." : "Validate PIN Access"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
