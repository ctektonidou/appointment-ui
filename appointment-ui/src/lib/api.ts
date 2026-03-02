// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Some endpoints may return empty body
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {} as T;

  return res.json() as Promise<T>;
}

// ---- Types (keep near API for now; later you can move to /types) ----
export type Business = {
  id: number;
  ownerUserId: number;
  name: string;
  industryId?: number | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  createdAt: string;
};

export function getBusinesses(ownerUserId: number) {
  return fetchJson<Business[]>(`/api/businesses?ownerUserId=${ownerUserId}`);
}