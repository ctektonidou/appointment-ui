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
  createdAt?: string;
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

const API_BASE = "http://localhost:8080/api";

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export async function listStaff(
  businessId: number,
  activeOnly = false
): Promise<Staff[]> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/staff?activeOnly=${String(activeOnly)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse<Staff[]>(response);
}

export async function getStaff(
  businessId: number,
  staffId: number
): Promise<Staff> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/staff/${staffId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse<Staff>(response);
}

export async function createStaff(
  businessId: number,
  req: CreateStaffRequest
): Promise<Staff> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  return handleResponse<Staff>(response);
}

export async function updateStaff(
  businessId: number,
  staffId: number,
  body: UpdateStaffRequest
): Promise<Staff> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/staff/${staffId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return handleResponse<Staff>(response);
}

export async function deleteStaff(
  businessId: number,
  staffId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/staff/${staffId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to delete staff member (status ${response.status})`
    );
  }
}