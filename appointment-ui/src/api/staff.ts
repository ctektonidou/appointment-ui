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
  isActive: boolean;
  createdAt?: string; // ISO string
};

export type CreateStaffRequest = {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
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

export async function deleteStaff(
  businessId: number,
  staffId: number
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/businesses/${businessId}/staff/${staffId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      text || `Failed to delete staff member (status ${res.status})`
    );
  }
}