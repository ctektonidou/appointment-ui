const API_BASE = "http://localhost:8080/api"; // or your real base

export type ServiceDto = {
  id: number;
  businessId: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceAmount: number | null;
  currency: string | null;
  colorHex: string | null;
  isActive: boolean;
};

export type Service = {
  id: number;
  businessId: number;
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

function mapService(dto: ServiceDto): Service {
  return {
    id: dto.id,
    businessId: dto.businessId,
    name: dto.name,
    description: dto.description,
    durationMinutes: dto.durationMinutes,
    priceEuros: dto.priceAmount ?? 0,
    colorHex: dto.colorHex,
    active: dto.isActive,
  };
}

function toBackendPayload(values: ServiceFormValues) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    durationMinutes: values.durationMinutes,
    priceAmount: values.priceEuros,
    currency: "EUR",
    colorHex: values.colorHex?.trim() || null,
    isActive: values.active,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function listServices(
  businessId: number,
  activeOnly = false
): Promise<Service[]> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/services?activeOnly=${activeOnly}`
  );

  const data = await handleResponse<ServiceDto[]>(response);
  return data.map(mapService);
}

export async function createService(
  businessId: number,
  values: ServiceFormValues
): Promise<Service> {
  const response = await fetch(`${API_BASE}/businesses/${businessId}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: values.name.trim(),
      description: values.description?.trim() || null,
      durationMinutes: values.durationMinutes,
      priceAmount: values.priceEuros,
      currency: "EUR",
      colorHex: values.colorHex?.trim() || null,
      isActive: values.active,
    }),
  });

  const data = await handleResponse<ServiceDto>(response);
  return mapService(data);
}

export async function updateService(
  businessId: number,
  serviceId: number,
  values: Partial<ServiceFormValues>
): Promise<Service> {
  const payload = {
    ...(values.name !== undefined ? { name: values.name.trim() } : {}),
    ...(values.description !== undefined
      ? { description: values.description?.trim() || null }
      : {}),
    ...(values.durationMinutes !== undefined
      ? { durationMinutes: values.durationMinutes }
      : {}),
    ...(values.priceEuros !== undefined
      ? { priceAmount: values.priceEuros, currency: "EUR" }
      : {}),
    ...(values.colorHex !== undefined
      ? { colorHex: values.colorHex?.trim() || null }
      : {}),
    ...(values.active !== undefined ? { isActive: values.active } : {}),
  };

  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/services/${serviceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await handleResponse<ServiceDto>(response);
  return mapService(data);
}

export async function deleteService(
  businessId: number,
  serviceId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/services/${serviceId}`,
    {
      method: "DELETE",
    }
  );

  await handleResponse<void>(response);
}

export async function activateService(
  businessId: number,
  serviceId: number
): Promise<Service> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/services/${serviceId}/activate`,
    {
      method: "PATCH",
    }
  );

  const data = await handleResponse<ServiceDto>(response);
  return mapService(data);
}

export async function deactivateService(
  businessId: number,
  serviceId: number
): Promise<Service> {
  const response = await fetch(
    `${API_BASE}/businesses/${businessId}/services/${serviceId}/deactivate`,
    {
      method: "PATCH",
    }
  );

  const data = await handleResponse<ServiceDto>(response);
  return mapService(data);
}