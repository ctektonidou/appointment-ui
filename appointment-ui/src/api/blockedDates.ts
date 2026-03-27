const API_BASE_URL = "http://localhost:8080";

export type BlockedDateResponse = {
  id: number;
  businessId: number;
  staffId: number | null;
  date: string;
  reason: string | null;
};

export type CreateBlockedDateRequest = {
  staffId?: string | null;
  date: string;
  reason?: string | null;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getBlockedDatesForStaffUser(
  userId: number
): Promise<BlockedDateResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/blocked-dates/staff/user/${userId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  return handleResponse<BlockedDateResponse[]>(response);
}

export async function createBlockedDateForStaffUser(
  userId: number,
  payload: CreateBlockedDateRequest
): Promise<BlockedDateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/blocked-dates/staff/user/${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<BlockedDateResponse>(response);
}

export async function deleteBlockedDateForStaffUser(
  userId: number,
  blockedDateId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/blocked-dates/staff/user/${userId}/${blockedDateId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  return handleResponse<void>(response);
}

export async function getBusinessBlockedDates(
  businessId: number
): Promise<BlockedDateResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/blocked-dates`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse<BlockedDateResponse[]>(response);
}

export async function createBusinessBlockedDate(
  businessId: number,
  payload: CreateBlockedDateRequest
): Promise<BlockedDateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/blocked-dates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<BlockedDateResponse>(response);
}

export async function deleteBusinessBlockedDate(
  businessId: number,
  blockedDateId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/blocked-dates/${blockedDateId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse<void>(response);
}