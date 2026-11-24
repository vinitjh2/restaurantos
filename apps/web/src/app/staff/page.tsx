"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Plus,
  Shield,
  ShieldCheck,
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
  Sliders,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  ChevronRight,
  Filter,
  UserCog,
  Pencil,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ALL_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATEGORIES,
  PERMISSION_METADATA,
  PERMISSIONS,
  PermissionCategory,
  PermissionCode,
  SystemRole,
} from "@/lib/server/rbac-engine";

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: SystemRole;
  pinConfigured: boolean;
  hourlyRate: number;
  monthlySalary: number;
  permissions: string; // JSON string
  isActive: boolean;
  joinedAt: string;
}

interface RoleConfigItem {
  role: SystemRole;
  permissions: PermissionCode[];
  isCustomized: boolean;
  updatedBy?: string | null;
  updatedAt?: string | null;
  assignedStaffCount: number;
}

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "ROLES" | "PIN_TEST">("DIRECTORY");
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Role permissions state
  const [roleConfigs, setRoleConfigs] = useState<RoleConfigItem[]>([]);
  const [selectedRole, setSelectedRole] = useState<SystemRole>("CASHIER");
  const [activeRolePerms, setActiveRolePerms] = useState<Record<SystemRole, PermissionCode[]>>({
    ...DEFAULT_ROLE_PERMISSIONS,
  });
  const [workingRolePerms, setWorkingRolePerms] = useState<PermissionCode[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modals state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showManageAccessModal, setShowManageAccessModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [showPinAuthModal, setShowPinAuthModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Employee Custom Access Form
  const [accessMode, setAccessMode] = useState<"ROLE_DEFAULT" | "CUSTOM">("ROLE_DEFAULT");
  const [customPerms, setCustomPerms] = useState<PermissionCode[]>([]);
  const [newPinCode, setNewPinCode] = useState("");

  // Edit Staff Form
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CASHIER" as SystemRole,
    monthlySalary: 0,
    hourlyRate: 0,
    isActive: true,
  });

  // Add Staff Form
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CASHIER" as SystemRole,
    pinCode: "",
    monthlySalary: 28000,
    hourlyRate: 0,
  });

  // PIN Test Form
  const [pinAuthForm, setPinAuthForm] = useState({
    pinCode: "",
    action: "ORDER_REFUND",
    requiredPermission: "pos:refund",
    details: "Testing supervisor authorization override",
  });
  const [pinAuthResult, setPinAuthResult] = useState<any>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const notify = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 6000);
  };

  // 1. Fetch Staff and Role Configurations
  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes] = await Promise.all([
        fetch("/api/staff"),
        fetch("/api/staff/roles"),
      ]);

      const staffData = await staffRes.json();
      if (staffData.success) {
        setStaffList(staffData.staff || []);
      }

      const rolesData = await rolesRes.json();
      if (rolesData.success) {
        setRoleConfigs(rolesData.roles || []);
        setActiveRolePerms(rolesData.activeRolesMap || DEFAULT_ROLE_PERMISSIONS);
        // Sync working role perms for selected role
        const curRolePerms =
          rolesData.activeRolesMap?.[selectedRole] ||
          DEFAULT_ROLE_PERMISSIONS[selectedRole] ||
          [];
        setWorkingRolePerms([...curRolePerms]);
      }
    } catch (err: any) {
      console.error("Error loading staff data:", err);
      notify("error", "Failed to load staff roster and role permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync working role permissions when selected role changes
  useEffect(() => {
    const perms = activeRolePerms[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];
    setWorkingRolePerms([...perms]);
  }, [selectedRole, activeRolePerms]);

  // 2. Add New Staff Member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStaff(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Staff member created successfully");
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
        notify("error", data.error || "Failed to add staff member");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to add staff member");
    } finally {
      setSavingStaff(false);
    }
  };

  // 3. Open Employee Access Management Drawer
  const handleOpenManageAccess = (staff: StaffMember) => {
    setSelectedStaff(staff);
    let parsedPerms: PermissionCode[] = [];
    try {
      if (staff.permissions) {
        parsedPerms = JSON.parse(staff.permissions);
      }
    } catch {
      parsedPerms = [];
    }

    if (Array.isArray(parsedPerms) && parsedPerms.length > 0) {
      setAccessMode("CUSTOM");
      setCustomPerms(parsedPerms);
    } else {
      setAccessMode("ROLE_DEFAULT");
      const defaultForRole = activeRolePerms[staff.role] || DEFAULT_ROLE_PERMISSIONS[staff.role] || [];
      setCustomPerms([...defaultForRole]);
    }

    setNewPinCode("");
    setShowManageAccessModal(true);
  };

  // 4. Save Employee Access Customizations
  const handleSaveEmployeeAccess = async () => {
    if (!selectedStaff) return;
    setSavingStaff(true);
    try {
      const finalPerms = accessMode === "ROLE_DEFAULT" ? [] : customPerms;
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStaff.id,
          permissions: finalPerms,
          ...(newPinCode ? { pinCode: newPinCode } : {}),
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify(
          "success",
          accessMode === "ROLE_DEFAULT"
            ? `${selectedStaff.name}'s permissions synced with '${selectedStaff.role}' defaults.`
            : `Custom permissions saved for ${selectedStaff.name} (${finalPerms.length} permissions granted).`
        );
        setShowManageAccessModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to update employee access");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to update employee access");
    } finally {
      setSavingStaff(false);
    }
  };

  // 5. Open Edit Staff Info
  const handleOpenEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditForm({
      name: staff.name,
      email: staff.email || "",
      phone: staff.phone,
      role: staff.role,
      monthlySalary: staff.monthlySalary,
      hourlyRate: staff.hourlyRate,
      isActive: staff.isActive,
    });
    setShowEditStaffModal(true);
  };

  // 6. Save Staff Info
  const handleSaveEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSavingStaff(true);
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStaff.id,
          ...editForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify("success", `Employee '${editForm.name}' updated successfully.`);
        setShowEditStaffModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to update staff member");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to update staff member");
    } finally {
      setSavingStaff(false);
    }
  };

  // 7. Toggle Staff Active Status
  const handleToggleStaffStatus = async (staff: StaffMember) => {
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: staff.id,
          isActive: !staff.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", `${staff.name} is now ${!staff.isActive ? "Active" : "Deactivated"}.`);
        loadData();
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to toggle status");
    }
  };

  // 8. Delete Staff Member
  const handleDeleteStaff = async (staff: StaffMember) => {
    if (!confirm(`Are you sure you want to remove ${staff.name} from DineSutra?`)) return;
    try {
      const res = await fetch(`/api/staff?id=${staff.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        notify("success", `${staff.name} deleted successfully.`);
        loadData();
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to delete staff member");
    }
  };

  // 9. Save Role Permissions (Owner Customization)
  const handleSaveRolePermissions = async () => {
    setSavingRole(true);
    try {
      const res = await fetch("/api/staff/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          permissions: workingRolePerms,
          updatedBy: "Restaurant Owner",
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify("success", data.message || `Permissions for ${selectedRole} saved successfully!`);
        // Update local map
        setActiveRolePerms((prev) => ({
          ...prev,
          [selectedRole]: workingRolePerms,
        }));
        loadData();
      } else {
        notify("error", data.error || "Failed to save role permissions");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to save role permissions");
    } finally {
      setSavingRole(false);
    }
  };

  // 10. Reset Role Permissions to Factory Defaults
  const handleResetRoleDefaults = async () => {
    const factoryDefaults = DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];
    if (
      !confirm(
        `Reset '${selectedRole}' to system factory defaults (${factoryDefaults.length} permissions)? This will erase custom overrides for this role.`
      )
    ) {
      return;
    }

    setSavingRole(true);
    try {
      const res = await fetch("/api/staff/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          action: "RESET",
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify("success", data.message || `${selectedRole} restored to system factory defaults.`);
        setWorkingRolePerms([...factoryDefaults]);
        setActiveRolePerms((prev) => ({
          ...prev,
          [selectedRole]: factoryDefaults,
        }));
        loadData();
      } else {
        notify("error", data.error || "Failed to reset role");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to reset role");
    } finally {
      setSavingRole(false);
    }
  };

  // Toggle single permission for working role
  const handleToggleWorkingPerm = (code: PermissionCode) => {
    setWorkingRolePerms((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  // Toggle single permission for custom employee
  const handleToggleCustomPerm = (code: PermissionCode) => {
    setCustomPerms((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  // Quick Preset Actions for Working Role
  const handleRoleSelectAll = () => {
    setWorkingRolePerms(Object.values(PERMISSIONS));
  };
  const handleRoleDeselectAll = () => {
    setWorkingRolePerms([]);
  };
  const handleRoleLoadDefault = () => {
    setWorkingRolePerms([...(DEFAULT_ROLE_PERMISSIONS[selectedRole] || [])]);
  };

  // Test PIN Authorization
  const handleTestPin = async (e: React.FormEvent) => {
    e.preventDefault();
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
    }
  };

  // Filter staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === "All" || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [staffList, search, roleFilter]);

  // Selected role config details
  const currentRoleConfig = useMemo(() => {
    return (
      roleConfigs.find((r) => r.role === selectedRole) || {
        role: selectedRole,
        permissions: workingRolePerms,
        isCustomized: false,
        updatedBy: "System Factory Default",
        updatedAt: null,
        assignedStaffCount: staffList.filter((s) => s.role === selectedRole && s.isActive).length,
      }
    );
  }, [roleConfigs, selectedRole, workingRolePerms, staffList]);

  // Filtered permission metadata for selected category / search
  const filteredPermissionsList = useMemo(() => {
    return Object.values(PERMISSION_METADATA).filter((meta) => {
      const matchesCategory =
        selectedCategory === "All" || meta.category === selectedCategory;
      const matchesQuery =
        !roleSearch ||
        meta.label.toLowerCase().includes(roleSearch.toLowerCase()) ||
        meta.description.toLowerCase().includes(roleSearch.toLowerCase()) ||
        meta.code.toLowerCase().includes(roleSearch.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, roleSearch]);

  // Check if working role has pending unsaved changes
  const hasUnsavedRoleChanges = useMemo(() => {
    const saved = activeRolePerms[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];
    if (saved.length !== workingRolePerms.length) return true;
    return !saved.every((p) => workingRolePerms.includes(p));
  }, [activeRolePerms, selectedRole, workingRolePerms]);

  // Factory default comparison
  const factoryPermsForSelected = DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)}>
            <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* 2. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-950 border border-amber-500/50 flex items-center justify-center overflow-hidden p-0.5 shadow-sm shrink-0">
            <img src="/dinesutra-logo.svg" alt="DineSutra" className="h-full w-full object-cover scale-125 rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Staff & Role Permissions
              </h1>
              <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                Owner Managed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize enterprise role privileges, assign custom employee overrides & configure supervisor PIN approvals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-1.5 text-xs border-slate-200 hover:bg-slate-100 font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-600" : "text-slate-500"}`} />
            <span>Sync</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPinAuthModal(true)}
            className="gap-1.5 text-xs text-amber-800 border-amber-300 bg-amber-50/70 hover:bg-amber-100 font-bold"
          >
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            <span>Test PIN Override</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddStaffModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 font-black shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("DIRECTORY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ROLES"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sliders className="h-3.5 w-3.5 text-amber-500" />
          <span>Role Permissions Matrix</span>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-black">
            Owner Access
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PIN_TEST")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "PIN_TEST"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>PIN Supervisor Tester</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: STAFF DIRECTORY                                         */}
      {/* ============================================================== */}
      {activeTab === "DIRECTORY" && (
        <div className="space-y-4">
          {/* Search & Role Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name, phone, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              <span className="text-slate-400 font-bold text-[11px] mr-1">Filter Role:</span>
              {["All", ...ALL_ROLES].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                    roleFilter === role
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-bold">Staff Member</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Access Permissions</th>
                    <th className="py-3 px-4 font-bold">Contact</th>
                    <th className="py-3 px-4 font-bold text-right">Salary</th>
                    <th className="py-3 px-4 font-bold text-center">4-Digit PIN</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No staff members match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s) => {
                      let customCount = 0;
                      let isCustomOverride = false;
                      try {
                        if (s.permissions) {
                          const p = JSON.parse(s.permissions);
                          if (Array.isArray(p) && p.length > 0) {
                            customCount = p.length;
                            isCustomOverride = true;
                          }
                        }
                      } catch {}

                      const roleCount =
                        activeRolePerms[s.role]?.length ||
                        DEFAULT_ROLE_PERMISSIONS[s.role]?.length ||
                        0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900">{s.name}</div>
                            <span className="text-[10px] text-slate-400">
                              Joined {new Date(s.joinedAt).toLocaleDateString("en-IN")}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-black ${
                                s.role === "OWNER"
                                  ? "bg-purple-50 text-purple-800 border-purple-300"
                                  : s.role === "MANAGER"
                                  ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                                  : s.role === "CASHIER"
                                  ? "bg-blue-50 text-blue-800 border-blue-300"
                                  : s.role === "WAITER"
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : s.role === "KITCHEN_STAFF"
                                  ? "bg-orange-50 text-orange-800 border-orange-300"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              {s.role}
                            </Badge>
                          </td>

                          {/* Access Permissions Status Badge */}
                          <td className="py-3.5 px-4">
                            {isCustomOverride ? (
                              <button
                                onClick={() => handleOpenManageAccess(s)}
                                className="group flex items-center gap-1.5 text-left"
                                title="Click to edit custom permissions"
                              >
                                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full group-hover:bg-amber-100 transition-colors">
                                  <Sliders className="h-3 w-3 text-amber-600" />
                                  <span>Custom Override ({customCount} perms)</span>
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenManageAccess(s)}
                                className="group flex items-center gap-1.5 text-left"
                                title="Click to override role permissions"
                              >
                                <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full group-hover:bg-slate-200 transition-colors">
                                  <Shield className="h-3 w-3 text-slate-500" />
                                  <span>Role Default ({roleCount} perms)</span>
                                </span>
                              </button>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-medium text-slate-800">{s.phone}</div>
                            {s.email && <div className="text-[10px] text-slate-400">{s.email}</div>}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            {s.monthlySalary > 0
                              ? `${formatINR(s.monthlySalary)}/mo`
                              : `₹${s.hourlyRate}/hr`}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <KeyRound className="h-2.5 w-2.5 text-emerald-600" />
                              <span>Configured</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleStaffStatus(s)}
                              title="Click to toggle active status"
                            >
                              <Badge
                                variant={s.isActive ? "success" : "secondary"}
                                className={`text-[10px] font-bold cursor-pointer ${
                                  s.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200 line-through"
                                }`}
                              >
                                {s.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </button>
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenManageAccess(s)}
                                className="h-7 text-[10px] font-bold gap-1 border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
                                title="Manage custom permissions"
                              >
                                <Sliders className="h-3 w-3 text-amber-600" />
                                <span>Access</span>
                              </Button>

                              <button
                                onClick={() => handleOpenEditStaff(s)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                                title="Edit staff details"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>

                              <button
                                onClick={() => handleDeleteStaff(s)}
                                className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                                title="Delete staff record"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ROLE PERMISSION MATRIX (OWNER CONTROL CENTER)           */}
      {/* ============================================================== */}
      {activeTab === "ROLES" && (
        <div className="space-y-5">
          {/* Top Role Selector Tabs */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Enterprise Role to Customize:
              </span>
              <span className="text-[11px] text-slate-400">
                8 Standard Roles Available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {ALL_ROLES.map((role) => {
                const isSelected = selectedRole === role;
                const assignedCount = staffList.filter((s) => s.role === role && s.isActive).length;
                const isCustom = roleConfigs.find((r) => r.role === role)?.isCustomized;

                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-md scale-102"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {isCustom && (
                      <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-amber-500 border-2 border-white" title="Customized by Owner" />
                    )}
                    <span className="font-extrabold text-xs tracking-tight">{role}</span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? "text-amber-300 font-bold" : "text-slate-400"}`}>
                      {assignedCount} Staff
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Control & Saving Command Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Role: {selectedRole}</span>
                </h2>

                {currentRoleConfig.isCustomized ? (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>Customized by Restaurant Owner</span>
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>System Factory Default</span>
                  </span>
                )}

                <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {workingRolePerms.length} of {Object.keys(PERMISSIONS).length} Privileges Active
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">
                Changes saved here will apply automatically to all staff members holding the <strong>{selectedRole}</strong> role (unless individually overridden).
              </p>
            </div>

            {/* Quick Actions & Save Button */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetRoleDefaults}
                disabled={savingRole}
                className="gap-1.5 text-xs text-slate-200 border-slate-700 bg-slate-800/80 hover:bg-slate-800 font-bold"
                title="Reset this role to factory defaults"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset to Default</span>
              </Button>

              <Button
                size="sm"
                onClick={handleSaveRolePermissions}
                disabled={savingRole || !hasUnsavedRoleChanges}
                className={`gap-1.5 text-xs font-black shadow-lg transition-all ${
                  hasUnsavedRoleChanges
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 scale-102 animate-pulse"
                    : "bg-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingRole ? "Saving..." : hasUnsavedRoleChanges ? "Save Changes" : "Saved"}</span>
              </Button>
            </div>
          </div>

          {/* Category Filter & Quick Selector Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              <span className="text-slate-400 font-bold text-[11px] mr-1">Category:</span>
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === "All"
                    ? "bg-slate-900 text-white font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Categories ({Object.keys(PERMISSIONS).length})
              </button>
              {PERMISSION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search permission..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="h-8 w-44 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleRoleSelectAll}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
              >
                Select All
              </button>
              <button
                onClick={handleRoleDeselectAll}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Granular Permissions Checkbox Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPermissionsList.map((meta) => {
              const isChecked = workingRolePerms.includes(meta.code);
              const isDefault = factoryPermsForSelected.includes(meta.code);

              return (
                <div
                  key={meta.code}
                  onClick={() => handleToggleWorkingPerm(meta.code)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isChecked
                      ? "bg-amber-50/40 border-amber-300/80 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="font-extrabold text-xs text-slate-900">
                          {meta.label}
                        </span>
                      </div>

                      {meta.isDangerous && (
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black px-1.5 py-0.2 rounded-md shrink-0 flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          <span>Restricted</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5 pl-6 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] pl-6 font-mono">
                    <span className="text-slate-400">{meta.code}</span>
                    <span className="text-slate-400">
                      {isDefault ? "Default in role" : "Customizable"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SUPERVISOR PIN OVERRIDE TESTER                          */}
      {/* ============================================================== */}
      {activeTab === "PIN_TEST" && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Staff 4-Digit PIN Authorization Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Verify if an employee PIN code can authorize sensitive POS actions like discounts or refunds.
              </p>
            </div>
          </div>

          <form onSubmit={handleTestPin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Enter 4-Digit Staff PIN
              </label>
              <input
                type="password"
                maxLength={4}
                required
                value={pinAuthForm.pinCode}
                onChange={(e) => setPinAuthForm({ ...pinAuthForm, pinCode: e.target.value })}
                placeholder="••••"
                className="w-full h-10 px-4 rounded-xl border border-slate-200 font-mono text-center tracking-widest text-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Action Type</label>
                <select
                  value={pinAuthForm.action}
                  onChange={(e) => setPinAuthForm({ ...pinAuthForm, action: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="ORDER_REFUND">Order Refund</option>
                  <option value="BILL_DISCOUNT">Bill Discount</option>
                  <option value="CANCEL_ORDER">Void Order</option>
                  <option value="DRAWER_KICK">Manual Cash Till Kick</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Required Permission</label>
                <select
                  value={pinAuthForm.requiredPermission}
                  onChange={(e) => setPinAuthForm({ ...pinAuthForm, requiredPermission: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="pos:refund">pos:refund</option>
                  <option value="pos:bill_discount">pos:bill_discount</option>
                  <option value="pos:cancel_order">pos:cancel_order</option>
                  <option value="inventory:adjust_wastage">inventory:adjust_wastage</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full bg-slate-900 text-white font-bold h-9">
              Simulate Authorization Check
            </Button>
          </form>

          {/* Test Results */}
          {pinAuthResult && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in-50 ${
                pinAuthResult.authorized
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-rose-50 border-rose-300 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {pinAuthResult.authorized ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{pinAuthResult.authorized ? "AUTHORIZATION GRANTED" : "AUTHORIZATION DENIED"}</span>
                </span>
                {pinAuthResult.staff && (
                  <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded border">
                    {pinAuthResult.staff.name} ({pinAuthResult.staff.role})
                  </span>
                )}
              </div>
              <p className="text-[11px]">{pinAuthResult.error || "Staff PIN and role verified successfully."}</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD STAFF MEMBER                                      */}
      {/* ============================================================== */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-600" />
                <span>Register Employee</span>
              </h2>
              <button onClick={() => setShowAddStaffModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as SystemRole })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-semibold"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">4-Digit POS PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={newStaff.pinCode}
                    onChange={(e) => setNewStaff({ ...newStaff, pinCode: e.target.value })}
                    placeholder="••••"
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
                    placeholder="staff@dinesutra.in"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newStaff.monthlySalary}
                    onChange={(e) => setNewStaff({ ...newStaff, monthlySalary: Number(e.target.value) })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
                💡 <strong>Permissions:</strong> This employee will automatically inherit the active permissions configured for <strong>{newStaff.role}</strong>. You can customize them individually anytime after creating.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddStaffModal(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingStaff}
                  className="bg-slate-900 text-white text-xs font-black shadow-md"
                >
                  {savingStaff ? "Saving..." : "Register Employee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: MANAGE INDIVIDUAL EMPLOYEE ACCESS & PERMISSIONS       */}
      {/* ============================================================== */}
      {showManageAccessModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Manage Permissions for {selectedStaff.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Role: <strong className="text-slate-800">{selectedStaff.role}</strong> · Phone: {selectedStaff.phone}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowManageAccessModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAccessMode("ROLE_DEFAULT")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  accessMode === "ROLE_DEFAULT"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Inherit {selectedStaff.role} Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessMode("CUSTOM")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  accessMode === "CUSTOM"
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Custom Override for This Employee</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {accessMode === "ROLE_DEFAULT" ? (
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs text-blue-950 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Synchronized with {selectedStaff.role} Role</span>
                  </div>
                  <p className="leading-relaxed">
                    This employee will automatically inherit the <strong>{activeRolePerms[selectedStaff.role]?.length || 0} active permissions</strong> configured by the Owner for the <strong>{selectedStaff.role}</strong> role. Any future changes you make in the Role Matrix will automatically apply to {selectedStaff.name}.
                  </p>
                  <div className="pt-2 border-t border-blue-200/80">
                    <span className="text-[11px] font-bold text-blue-800 block mb-1.5">
                      Included Permissions:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(activeRolePerms[selectedStaff.role] || DEFAULT_ROLE_PERMISSIONS[selectedStaff.role] || []).map((p) => (
                        <span key={p} className="bg-white/80 text-blue-900 px-2 py-0.5 rounded text-[10px] font-mono border border-blue-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-950">
                    <span className="font-semibold">
                      Granting individual custom permissions ({customPerms.length} selected)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomPerms(Object.values(PERMISSIONS))}
                        className="text-[10px] font-bold bg-white px-2 py-1 rounded border border-amber-300 hover:bg-amber-100"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomPerms([])}
                        className="text-[10px] font-bold bg-white px-2 py-1 rounded border border-amber-300 hover:bg-amber-100"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.values(PERMISSION_METADATA).map((meta) => {
                      const isChecked = customPerms.includes(meta.code);
                      return (
                        <div
                          key={meta.code}
                          onClick={() => handleToggleCustomPerm(meta.code)}
                          className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                            isChecked
                              ? "bg-amber-50/60 border-amber-400 font-semibold"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{meta.label}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                            {meta.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional Quick PIN Reset */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Reset 4-Digit Quick POS PIN (Optional)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPinCode}
                  onChange={(e) => setNewPinCode(e.target.value)}
                  placeholder="Leave blank to keep existing PIN"
                  className="w-full h-8 px-3 rounded-xl border border-slate-200 font-mono text-center tracking-widest text-xs"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManageAccessModal(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEmployeeAccess}
                disabled={savingStaff}
                className="bg-slate-900 text-white text-xs font-black shadow-md"
              >
                {savingStaff ? "Saving..." : "Save Employee Permissions"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT STAFF BASIC INFO                                 */}
      {/* ============================================================== */}
      {showEditStaffModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-blue-600" />
                <span>Edit Staff: {selectedStaff.name}</span>
              </h2>
              <button onClick={() => setShowEditStaffModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as SystemRole })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-semibold"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={editForm.monthlySalary}
                    onChange={(e) => setEditForm({ ...editForm, monthlySalary: Number(e.target.value) })}
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Account is Active (Uncheck to temporarily suspend access)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditStaffModal(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingStaff}
                  className="bg-slate-900 text-white text-xs font-black shadow-md"
                >
                  {savingStaff ? "Saving..." : "Save Details"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
