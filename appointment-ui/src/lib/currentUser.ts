import type { UserRole } from "../types/auth";

export interface CurrentUser {
  id: number;
  name: string;
  role: UserRole;
  businessName: string;
}

export const mockCurrentUser: CurrentUser = {
  id: 1,
  name: "John Smith",
  role: "customer",       // ⬅ change this to "staff" or "customer" to see different menus
  businessName: "Business Name",
};