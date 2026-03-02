import { http } from "./http";

export type Staff = {
  id: number;
  businessId: number;
  userId?: number | null;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  colorHex?: string | null;
  isActive: boolean;
  createdAt?: string; // ISO string
};

export type CreateStaffRequest = {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  colorHex?: string | null;
  isActive?: boolean;
  userId?: number | null;
};

export async function listStaff(businessId: number): Promise<Staff[]> {
  // Adjust path if your backend differs
  return http<Staff[]>(`/api/businesses/${businessId}/staff`);
}

export async function createStaff(
  businessId: number,
  req: CreateStaffRequest
): Promise<Staff> {
  return http<Staff>(`/api/businesses/${businessId}/staff`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}