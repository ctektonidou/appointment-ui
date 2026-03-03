// src/api/services.ts
export type Service = {
  id: number;
  name: string;
  durationMinutes: number;
  priceEuros: number;
  active: boolean;
};

const BASE_URL = "http://localhost:8080/api"; // adjust if needed

export async function listServices(businessId: number): Promise<Service[]> {
  const res = await fetch(`${BASE_URL}/businesses/${businessId}/services`);
  if (!res.ok) {
    throw new Error("Failed to load services");
  }
  return res.json();
}

export async function updateService(
  businessId: number,
  serviceId: number,
  partial: Partial<Pick<Service, "name" | "durationMinutes" | "priceEuros" | "active">>
): Promise<Service> {
  const res = await fetch(
    `${BASE_URL}/businesses/${businessId}/services/${serviceId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    }
  );
  if (!res.ok) {
    throw new Error("Failed to update service");
  }
  return res.json();
}

export async function deleteService(
  businessId: number,
  serviceId: number
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/businesses/${businessId}/services/${serviceId}`,
    { method: "DELETE" }
  );
  if (!res.ok) {
    throw new Error("Failed to delete service");
  }
}