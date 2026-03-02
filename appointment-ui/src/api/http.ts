export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  // If backend returns errors, show them clearly
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  // Handle empty body (204 etc.)
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}