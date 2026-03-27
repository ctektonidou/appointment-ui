import type { DayKey, StaffAvailability, UserRole } from "./Availability.types";

export const DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DAY_LABELS: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export function getStoredUserRole(): UserRole {
  const storedRole = localStorage.getItem("userRole");

  if (storedRole === "business" || storedRole === "owner") return "owner";
  if (storedRole === "staff") return "staff";
  return "customer";
}

export function getStoredUserId(): number | null {
  const storedUserId = localStorage.getItem("userId");
  if (!storedUserId) return null;

  const parsed = Number(storedUserId);
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildTimeOptions(
  startHour = 8,
  endHour = 21,
  stepMinutes = 30
): string[] {
  const out: string[] = [];

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour && m > 0) continue;
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }

  return out;
}

export const TIME_OPTIONS = buildTimeOptions(8, 21, 30);

export function newId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatBlockedTableDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
}

export function getMonthName(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, monthIndex: number) {
  const jsDay = new Date(year, monthIndex, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateString(year: number, monthIndex: number, day: number) {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export const BASE_STAFF: StaffAvailability[] = [
  { staffId: 1, staffName: "Josh Smith", enabled: true, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 2, staffName: "Anna Peter", enabled: true, ranges: [{ id: 1, from: "10:00", to: "18:00" }] },
  { staffId: 3, staffName: "Smith Green", enabled: true, ranges: [{ id: 1, from: "09:00", to: "15:00" }] },
  { staffId: 4, staffName: "Lena Nock", enabled: true, ranges: [{ id: 1, from: "12:00", to: "20:00" }] },
  { staffId: 5, staffName: "Finn Miam", enabled: false, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 6, staffName: "Liam Payne", enabled: true, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
  { staffId: 7, staffName: "Louis Tim", enabled: false, ranges: [{ id: 1, from: "09:00", to: "17:00" }] },
];

export function cloneStaffList(source: StaffAvailability[]) {
  return source.map((s) => ({
    ...s,
    ranges: s.ranges.map((r) => ({ ...r, id: newId() })),
  }));
}