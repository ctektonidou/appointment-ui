export type UserRole = "owner" | "staff" | "customer";
export type AvailabilityTopTab =
  | "businessHours"
  | "availability"
  | "availabilityOverrides"
  | "blockedDays";

export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type TimeRange = {
  id: number;
  from: string;
  to: string;
};

export type StaffAvailability = {
  staffId: number;
  staffName: string;
  enabled: boolean;
  ranges: TimeRange[];
};

export type BusinessHoursDay = {
  day: DayKey;
  label: string;
  enabled: boolean;
  from: string;
  to: string;
};

export type BlockedDate = {
  id: number;
  date: string;
  reason: string;
};