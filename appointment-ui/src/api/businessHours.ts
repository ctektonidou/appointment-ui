const API_BASE_URL = "http://localhost:8080";

export type BusinessHoursDto = {
  dayOfWeek: number; // 1..7 => Mon..Sun
  isOpen: boolean;
  openTime: string | null;   // "09:00:00"
  closeTime: string | null;  // "17:00:00"
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getBusinessHours(
  businessId: number
): Promise<BusinessHoursDto[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/hours`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse<BusinessHoursDto[]>(response);
}

export async function saveBusinessHours(
  businessId: number,
  payload: BusinessHoursDto[]
): Promise<BusinessHoursDto[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/hours`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<BusinessHoursDto[]>(response);
}