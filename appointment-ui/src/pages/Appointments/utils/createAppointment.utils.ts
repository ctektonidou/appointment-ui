import { BASE_TIME_SLOTS } from "../types/createAppointment.data";
import type { UserRole } from "../types/createAppointment.types";

export function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

export function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getFirstDayOffsetSundayFirst(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).getDay();
}

export function formatSummaryDate(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("en-GB");
}

export function buildMonthGrid(year: number, monthIndex: number) {
  const totalDays = getDaysInMonth(year, monthIndex);
  const startOffset = getFirstDayOffsetSundayFirst(year, monthIndex);

  const cells: Array<number | null> = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    cells.push(d);
  }

  return cells;
}

export function getMonthName(date: Date) {
  return date.toLocaleString("en-US", { month: "long" });
}

export function createDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export async function getAvailableTimeSlots(params: {
  businessId: number;
  serviceId: number;
  staffId: number;
  date: Date;
}): Promise<string[]> {
  const { staffId, date } = params;

  await new Promise((resolve) => setTimeout(resolve, 350));

  const dayOfMonth = date.getDate();

  if (staffId === 1) {
    return BASE_TIME_SLOTS.filter((_, index) => (index + dayOfMonth) % 4 !== 0);
  }

  if (staffId === 2) {
    return BASE_TIME_SLOTS.filter((_, index) => (index + dayOfMonth) % 3 !== 0);
  }

  return BASE_TIME_SLOTS.filter((_, index) => (index + dayOfMonth) % 5 !== 0);
}