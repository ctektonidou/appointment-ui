const API_BASE_URL = "http://localhost:8080/api/public";

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export type IndustryResponse = {
  id: number;
  industryCode: string;
  industryName: string;
};

export async function listPublicIndustries(): Promise<IndustryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/industries`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<IndustryResponse[]>(response);
}

export async function listPublicLocations(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<string[]>(response);
}