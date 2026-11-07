/**
 * Format a number to Indian Rupees (INR) currency representation
 * e.g. 124500 -> "₹1,24,500.00" or "₹1,24,500"
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return formatted;
}

/**
 * Format timestamp into standard readable date
 */
export function formatIndianDate(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format timestamp into standard 12-hour time
 */
export function formatTime(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}
