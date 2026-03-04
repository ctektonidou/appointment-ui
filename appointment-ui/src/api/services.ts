export type Service = {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceEuros: number;
  colorHex: string | null;
  active: boolean;
};

export type ServiceFormValues = {
  name: string;
  description?: string | null;
  durationMinutes: number;
  priceEuros: number;
  colorHex?: string | null;
  active: boolean;
};

const BASE_URL = "http://localhost:8080/api"; // adjust

export async function listServices(businessId: number): Promise<Service[]> {
  const res = await fetch(`${BASE_URL}/businesses/${businessId}/services`);
  if (!res.ok) throw new Error("Failed to load services");
  return res.json();
}

export async function createService(
  businessId: number,
  body: ServiceFormValues
): Promise<Service> {
  const res = await fetch(`${BASE_URL}/businesses/${businessId}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create service");
  return res.json();
}

export async function updateService(
  businessId: number,
  serviceId: number,
  body: Partial<ServiceFormValues>
): Promise<Service> {
  const res = await fetch(
    `${BASE_URL}/businesses/${businessId}/services/${serviceId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error("Failed to update service");
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
  if (!res.ok) throw new Error("Failed to delete service");
}