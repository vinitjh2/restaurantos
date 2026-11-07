/**
 * Format a number to Indian Rupees (INR) currency representation
 * e.g. 124500 -> "₹1,24,500" or "₹1,24,500.00"
 * Deterministic formatting across Node.js SSR and all browsers (Edge, Chrome, Safari)
 * Prevents React hydration mismatch errors caused by locale ICU spacing variances.
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  const num = Math.round(Number(amount) || 0);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const str = absNum.toString();
  let result = "";

  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.slice(-3);
    const rest = str.slice(0, -3);
    const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    result = `${formattedRest},${lastThree}`;
  }

  const decimals = showDecimals ? ".00" : "";
  return `${isNegative ? "-" : ""}₹${result}${decimals}`;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format timestamp into standard readable date: "Sat, 7 Nov 2026"
 * Pure deterministic formatting avoiding Node.js vs Browser comma variances.
 */
export function formatIndianDate(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const dayName = DAYS[d.getDay()];
  const day = d.getDate();
  const monthName = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format timestamp into standard 12-hour time: "1:30 pm"
 */
export function formatTime(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}
