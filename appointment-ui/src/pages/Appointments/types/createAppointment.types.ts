export type UserRole = "owner" | "staff" | "customer";

export type StepKey = 1 | 2 | 3 | 4;

export type BusinessCard = {
  id: number;
  name: string;
  category: string;
  location: string;
  openHours: string;
  services: string;
};

export type ServiceItem = {
  id: number;
  businessId: number;
  name: string;
  durationMinutes: number;
  price: number;
};

export type StaffMember = {
  id: number;
  name: string;
};

export type AppointmentFilters = {
  industry: string;
  location: string;
  searchName: string;
};