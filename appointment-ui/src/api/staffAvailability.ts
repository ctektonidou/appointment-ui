const API_BASE = "http://localhost:8080/api";

export type StaffAvailabilityDto = {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export async function getStaffAvailability(
  businessId: number,
  staffId: number
): Promise<StaffAvailabilityDto[]> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/staff/${staffId}/availability`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse<StaffAvailabilityDto[]>(response);
}

export async function saveStaffAvailability(
  businessId: number,
  staffId: number,
  body: StaffAvailabilityDto[]
): Promise<StaffAvailabilityDto[]> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/staff/${staffId}/availability`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return handleResponse<StaffAvailabilityDto[]>(response);
}