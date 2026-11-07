export interface ShiftTiming {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  lateThresholdMins: number; // 15
}

/**
 * Determine if clock-in is late compared to scheduled shift start
 */
export function checkLateArrival(
  clockInDate: Date,
  shiftStartTime: string = "09:00",
  lateThresholdMins: number = 15
): boolean {
  const [hours, mins] = shiftStartTime.split(":").map(Number);
  const scheduledTime = new Date(clockInDate);
  scheduledTime.setHours(hours, mins, 0, 0);

  const thresholdTime = new Date(scheduledTime.getTime() + lateThresholdMins * 60 * 1000);
  return clockInDate > thresholdTime;
}

/**
 * Calculate hours worked and overtime
 */
export function calculateShiftHours(
  clockInTime: Date,
  clockOutTime: Date,
  standardShiftHours: number = 8.0
): {
  totalHoursWorked: number;
  overtimeHours: number;
} {
  const diffMs = clockOutTime.getTime() - clockInTime.getTime();
  const totalHoursWorked = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
  const overtimeHours = Math.max(0, Math.round((totalHoursWorked - standardShiftHours) * 10) / 10);

  return { totalHoursWorked, overtimeHours };
}

/**
 * Calculate monthly payroll line for a staff member
 */
export function computeStaffPayroll(params: {
  calculationType: "MONTHLY" | "HOURLY";
  monthlySalary: number;
  hourlyRate: number;
  daysPresent: number;
  totalDaysInMonth?: number;
  hoursWorked: number;
  overtimeHours: number;
  bonuses: number;
  deductions: number;
}): {
  baseAmount: number;
  overtimePay: number;
  grossAmount: number;
  netSalary: number;
} {
  const {
    calculationType,
    monthlySalary,
    hourlyRate,
    daysPresent,
    totalDaysInMonth = 30,
    hoursWorked,
    overtimeHours,
    bonuses,
    deductions,
  } = params;

  let baseAmount = 0;
  let effectiveHourlyRate = hourlyRate;

  if (calculationType === "MONTHLY") {
    // Pro-rated monthly salary based on attendance days
    const dailyRate = monthlySalary / Math.max(1, totalDaysInMonth);
    baseAmount = Math.round(dailyRate * daysPresent * 100) / 100;
    effectiveHourlyRate = dailyRate / 8; // standard 8 hr day
  } else {
    // Hourly calculation
    baseAmount = Math.round(hourlyRate * hoursWorked * 100) / 100;
  }

  // Overtime pay at 1.5x effective hourly rate
  const overtimePay = Math.round(overtimeHours * (effectiveHourlyRate * 1.5) * 100) / 100;
  const grossAmount = Math.round((baseAmount + overtimePay + bonuses) * 100) / 100;
  const netSalary = Math.max(0, Math.round((grossAmount - deductions) * 100) / 100);

  return {
    baseAmount,
    overtimePay,
    grossAmount,
    netSalary,
  };
}
