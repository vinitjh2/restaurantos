"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertOctagon,
  X,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  KeyRound,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AttendanceRosterItem {
  staffId: string;
  name: string;
  role: string;
  phone: string;
  status: "CLOCKED_IN" | "CLOCKED_OUT" | "ON_LEAVE" | "NOT_CLOCKED_IN";
  clockInTime?: string;
  clockOutTime?: string;
  shiftName: string;
  totalHoursWorked: number;
  overtimeHours: number;
  isLate: boolean;
  leaveDetails?: { type: string; reason: string };
}

interface StaffLeave {
  id: string;
  staffId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy?: string;
  staff: { name: string; role: string };
}

interface StaffPayrollSlip {
  id: string;
  staffId: string;
  calculationType: string;
  baseAmount: number;
  daysPresent: number;
  hoursWorked: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: "PENDING" | "PAID";
  paymentMethod?: string;
  paymentRef?: string;
  paidAt?: string;
  staff: {
    name: string;
    role: string;
    phone: string;
    monthlySalary: number;
  };
}

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"ROSTER" | "LEAVES" | "PAYROLL">("ROSTER");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [roster, setRoster] = useState<AttendanceRosterItem[]>([]);
  const [leaves, setLeaves] = useState<StaffLeave[]>([]);
  const [payrollSlips, setPayrollSlips] = useState<StaffPayrollSlip[]>([]);
  const [payrollTotal, setPayrollTotal] = useState(0);

  const [summary, setSummary] = useState({
    totalStaff: 0,
    clockedInCount: 0,
    lateArrivalsCount: 0,
    onLeaveCount: 0,
  });

  // Modals
  const [showClockModal, setShowClockModal] = useState(false);
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [showPaySalaryModal, setShowPaySalaryModal] = useState(false);
  const [selectedSlipForPay, setSelectedSlipForPay] = useState<StaffPayrollSlip | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [clockPin, setClockPin] = useState("");
  const [leaveForm, setLeaveForm] = useState({
    staffId: "",
    leaveType: "CASUAL_LEAVE",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
    totalDays: 1,
    reason: "",
  });

  const [salaryPayForm, setSalaryPayForm] = useState({
    paymentMethod: "BANK_TRANSFER",
    paymentRef: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [attRes, leaveRes, payRes] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/attendance/leaves"),
        fetch("/api/payroll"),
      ]);

      const attData = await attRes.json();
      const leaveData = await leaveRes.json();
      const payData = await payRes.json();

      if (attData.success) {
        setRoster(attData.roster || []);
        if (attData.summary) setSummary(attData.summary);
        if (attData.roster?.length > 0 && !leaveForm.staffId) {
          setLeaveForm((prev) => ({ ...prev, staffId: attData.roster[0].staffId }));
        }
      }
      if (leaveData.success) {
        setLeaves(leaveData.leaves || []);
      }
      if (payData.success && payData.payrollRun) {
        setPayrollSlips(payData.payrollRun.staffPayrolls || []);
        setPayrollTotal(payData.payrollRun.totalNet || 0);
      }
    } catch (err: any) {
      console.error("Error loading workforce data:", err);
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

  // Clock in / out with PIN
  const handleClockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinCode: clockPin }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Clock action processed");
        setShowClockModal(false);
        setClockPin("");
        loadData();
      } else {
        notify("error", data.error || "Clock failed");
      }
    } catch (err: any) {
      notify("error", err.message || "Clock failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Apply Leave
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveForm),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Leave application submitted");
        setShowApplyLeaveModal(false);
        setLeaveForm({
          staffId: roster[0]?.staffId || "",
          leaveType: "CASUAL_LEAVE",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
          totalDays: 1,
          reason: "",
        });
        loadData();
      } else {
        notify("error", data.error || "Failed to submit leave");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to submit leave");
    } finally {
      setSubmitting(false);
    }
  };

  // Approve / Reject Leave
  const handleLeaveDecision = async (leaveId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch("/api/attendance/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, leaveId, approvedBy: "Ananya Roy (Manager)" }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message);
        loadData();
      } else {
        notify("error", data.error || "Action failed");
      }
    } catch (err: any) {
      notify("error", err.message || "Action failed");
    }
  };

  // Generate Monthly Payroll
  const handleGeneratePayroll = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GENERATE" }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Payroll calculated");
        loadData();
      } else {
        notify("error", data.error || "Failed to generate payroll");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to generate payroll");
    } finally {
      setSubmitting(false);
    }
  };

  // Pay Salary
  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlipForPay) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PAY",
          staffPayrollId: selectedSlipForPay.id,
          paymentMethod: salaryPayForm.paymentMethod,
          paymentRef: salaryPayForm.paymentRef || `SAL-NEFT-${Date.now().toString().slice(-6)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify("success", data.message || "Salary paid");
        setShowPaySalaryModal(false);
        loadData();
      } else {
        notify("error", data.error || "Failed to pay salary");
      }
    } catch (err: any) {
      notify("error", err.message || "Failed to pay salary");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRoster = roster.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

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
            <CalendarCheck className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Attendance, Leaves & Payroll</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric & PIN-based shift clock-in, late arrival tracking, leave management and attendance-based payroll
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
            onClick={() => setShowApplyLeaveModal(true)}
            className="gap-1.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
          >
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
            <span>Apply Leave</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowClockModal(true)}
            className="gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Clock In / Out (PIN)</span>
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Clocked-in Staff</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600">{summary.clockedInCount} on Shift</div>
          <div className="mt-1 text-[11px] text-slate-500">Out of {summary.totalStaff} total staff</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Late Arrivals Today</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-600">{summary.lateArrivalsCount} Flagged</div>
          <div className="mt-1 text-[11px] text-slate-500">Beyond 15-min shift threshold</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Staff on Leave</span>
            <XCircle className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-indigo-600">{summary.onLeaveCount} Approved</div>
          <div className="mt-1 text-[11px] text-slate-500">Casual & medical leaves</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Net Monthly Payroll</span>
            <DollarSign className="h-4 w-4 text-slate-800" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{formatINR(payrollTotal)}</div>
          <div className="mt-1 text-[11px] text-slate-500">Pro-rated attendance + overtime</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ROSTER")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "ROSTER"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          <span>Today's Shift Roster ({roster.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LEAVES")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "LEAVES"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Leave Requests ({leaves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PAYROLL")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "PAYROLL"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Monthly Payroll & Salary Slips ({payrollSlips.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY ROSTER */}
      {activeTab === "ROSTER" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Staff Member</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Assigned Shift</th>
                  <th className="py-3 px-4 font-semibold">Clock In</th>
                  <th className="py-3 px-4 font-semibold">Clock Out</th>
                  <th className="py-3 px-4 font-semibold text-right">Hours Worked</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.map((r) => (
                  <tr key={r.staffId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.name}</div>
                      <span className="text-[10px] text-slate-400">{r.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{r.role}</td>
                    <td className="py-3 px-4 text-slate-500">{r.shiftName}</td>
                    <td className="py-3 px-4">
                      {r.clockInTime ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">
                            {new Date(r.clockInTime).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {r.isLate && (
                            <Badge variant="warning" className="text-[9px] bg-amber-100 text-amber-800 border-amber-300">
                              Late
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {r.clockOutTime ? (
                        new Date(r.clockOutTime).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {r.totalHoursWorked > 0 ? `${r.totalHoursWorked} hrs` : "—"}
                      {r.overtimeHours > 0 && (
                        <span className="text-[10px] text-indigo-600 block font-bold">
                          +{r.overtimeHours}h OT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.status === "CLOCKED_IN" ? (
                        <Badge variant="success" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                          Present (Clocked In)
                        </Badge>
                      ) : r.status === "CLOCKED_OUT" ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Shift Completed
                        </Badge>
                      ) : r.status === "ON_LEAVE" ? (
                        <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-300">
                          On Leave
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-400">
                          Not Clocked In
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE MANAGEMENT */}
      {activeTab === "LEAVES" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Staff Member</th>
                  <th className="py-3 px-4 font-semibold">Leave Type</th>
                  <th className="py-3 px-4 font-semibold">Dates</th>
                  <th className="py-3 px-4 font-semibold text-center">Duration</th>
                  <th className="py-3 px-4 font-semibold">Reason</th>
                  <th className="py-3 px-4 font-semibold text-center">Approval Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{lv.staff?.name}</div>
                        <span className="text-[10px] text-slate-400">{lv.staff?.role}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{lv.leaveType}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(lv.startDate).toLocaleDateString("en-IN")} → {new Date(lv.endDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">{lv.totalDays} Day(s)</td>
                      <td className="py-3 px-4 text-slate-600 italic">"{lv.reason}"</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={lv.status === "APPROVED" ? "success" : lv.status === "REJECTED" ? "destructive" : "warning"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {lv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {lv.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleLeaveDecision(lv.id, "APPROVE")}
                              className="h-6 text-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLeaveDecision(lv.id, "REJECT")}
                              className="h-6 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {lv.approvedBy ? `Decided by ${lv.approvedBy}` : "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYROLL & SALARY SLIPS */}
      {activeTab === "PAYROLL" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-xs font-bold text-slate-900">Current Month Payroll (2026-11)</span>
              <p className="text-[11px] text-slate-500">
                Attendance-based pro-rated monthly salary, 1.5x overtime hourly rates and net payables.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleGeneratePayroll}
              disabled={submitting}
              className="gap-1.5 text-xs bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <RefreshCw className={`h-3 w-3 ${submitting ? "animate-spin" : ""}`} />
              <span>Recalculate Attendance Payroll</span>
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Staff Member</th>
                    <th className="py-3 px-4 font-semibold text-right">Base Salary</th>
                    <th className="py-3 px-4 font-semibold text-center">Days Present</th>
                    <th className="py-3 px-4 font-semibold text-right">Pro-rated Base</th>
                    <th className="py-3 px-4 font-semibold text-right">Overtime Pay</th>
                    <th className="py-3 px-4 font-semibold text-right">Bonuses / Tips</th>
                    <th className="py-3 px-4 font-semibold text-right">Deductions</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Salary</th>
                    <th className="py-3 px-4 font-semibold text-center">Payment Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollSlips.map((slip) => (
                    <tr key={slip.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{slip.staff?.name}</div>
                        <span className="text-[10px] text-slate-400">{slip.staff?.role}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700 font-medium">
                        {formatINR(slip.staff?.monthlySalary || 0)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {slip.daysPresent} Days
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {formatINR(slip.baseAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-indigo-600">
                        +{formatINR(slip.overtimePay)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600">
                        {slip.bonuses > 0 ? `+${formatINR(slip.bonuses)}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-rose-600">
                        {slip.deductions > 0 ? `-${formatINR(slip.deductions)}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                        {formatINR(slip.netSalary)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={slip.status === "PAID" ? "success" : "warning"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {slip.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {slip.status === "PENDING" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSlipForPay(slip);
                              setSalaryPayForm({
                                paymentMethod: "BANK_TRANSFER",
                                paymentRef: `SAL-NEFT-${Date.now().toString().slice(-6)}`,
                              });
                              setShowPaySalaryModal(true);
                            }}
                            className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700 gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Pay Salary</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Paid ({slip.paymentMethod})</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PIN CLOCK IN / OUT */}
      {showClockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                <span>Shift Clock In / Clock Out</span>
              </h2>
              <button onClick={() => setShowClockModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleClockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Enter Your 4-Digit Staff PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={clockPin}
                  onChange={(e) => setClockPin(e.target.value)}
                  placeholder="e.g. 1234, 2222, 3333"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-lg font-mono tracking-widest text-center font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowClockModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 text-white hover:bg-slate-800">
                  {submitting ? "Processing..." : "Confirm Clock Action"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY LEAVE */}
      {showApplyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span>Apply Staff Leave</span>
              </h2>
              <button onClick={() => setShowApplyLeaveModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Staff Member</label>
                <select
                  required
                  value={leaveForm.staffId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, staffId: e.target.value })}
                  className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                >
                  {roster.map((st) => (
                    <option key={st.staffId} value={st.staffId}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Leave Type</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="CASUAL_LEAVE">Casual Leave</option>
                    <option value="SICK_LEAVE">Sick / Medical Leave</option>
                    <option value="PAID_LEAVE">Paid Earned Leave</option>
                    <option value="UNPAID_LEAVE">Unpaid Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={leaveForm.totalDays}
                    onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: parseFloat(e.target.value) || 1 })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason for Leave</label>
                <input
                  type="text"
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Medical appointment, family occasion"
                  className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowApplyLeaveModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                  {submitting ? "Submitting..." : "Submit Leave Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PAY SALARY */}
      {showPaySalaryModal && selectedSlipForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Disburse Staff Salary</span>
                </h2>
                <span className="text-[11px] text-slate-500">Payee: {selectedSlipForPay.staff?.name} ({selectedSlipForPay.staff?.role})</span>
              </div>
              <button onClick={() => setShowPaySalaryModal(false)}>
                <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handlePaySalary} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Gross Pay (Base + OT + Tips):</span>
                  <span className="font-semibold text-slate-800">
                    {formatINR(selectedSlipForPay.baseAmount + selectedSlipForPay.overtimePay + selectedSlipForPay.bonuses)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Statutory Deductions (PF/Tax):</span>
                  <span className="font-semibold text-rose-600">-{formatINR(selectedSlipForPay.deductions)}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>Net Payable Amount:</span>
                  <span className="text-emerald-600">{formatINR(selectedSlipForPay.netSalary)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Disbursement Channel</label>
                  <select
                    value={salaryPayForm.paymentMethod}
                    onChange={(e) => setSalaryPayForm({ ...salaryPayForm, paymentMethod: e.target.value })}
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">Direct UPI Transfer</option>
                    <option value="CHEQUE">Salary Cheque</option>
                    <option value="CASH">Cash Pay Slip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Ref / UTR #</label>
                  <input
                    type="text"
                    required
                    value={salaryPayForm.paymentRef}
                    onChange={(e) => setSalaryPayForm({ ...salaryPayForm, paymentRef: e.target.value })}
                    placeholder="e.g. UTR-HDFC-992144"
                    className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPaySalaryModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {submitting ? "Processing..." : "Confirm & Pay Salary"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
