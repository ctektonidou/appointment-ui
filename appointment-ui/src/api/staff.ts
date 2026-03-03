import { http } from "./http";

const API_BASE = "http://localhost:8080/api";

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

export type UpdateStaffRequest = CreateStaffRequest;

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

export async function updateStaff(
  businessId: number,
  staffId: number,
  body: UpdateStaffRequest
): Promise<Staff> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/staff/${staffId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update staff");
  }
  return res.json();
}