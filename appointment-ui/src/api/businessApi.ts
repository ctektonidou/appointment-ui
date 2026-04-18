export type BusinessResponse = {
  id: number;
  ownerUserId: number;
  name: string;
  industryId: number | null;
  industryName: string;
  phone: string;
  email: string;
  timezone: string;
  address: string;
  logoUrl: string;
  createdAt: string;
  location: string;
};

const BASE_URL = "http://localhost:8080/api/businesses";

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export async function searchPublicBusinesses(params: {
  name?: string;
  location?: string;
  industryId?: number;
}): Promise<BusinessResponse[]> {
  const query = new URLSearchParams();

  if (params.name && params.name.trim() !== "") {
    query.set("name", params.name.trim());
  }

  if (params.industryId != null) {
    query.set("industryId", String(params.industryId));
  }

  if (params.location != null) {
    query.set("location", String(params.location));
  }

  const response = await fetch(`${BASE_URL}/public-search?${query.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<BusinessResponse[]>(response);
}

export async function getPrimaryBusinessByOwnerUserId(
  userId: number
): Promise<BusinessResponse> {
  const response = await fetch(
    `${BASE_URL}/owner/user/${userId}/primary`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse<BusinessResponse>(response);
}