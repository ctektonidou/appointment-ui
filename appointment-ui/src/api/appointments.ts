const API_BASE_URL = "http://localhost:8080";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CANCELLED"
  | "NO_SHOW"
  | "COMPLETED";

export type AppointmentListItemResponse = {
  id: number;
  businessId: number;
  serviceId: number;
  staffId: number;
  customerUserId: number | null;
  startTime: string;
  endTime: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  staffName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientNotes: string | null;
  status: AppointmentStatus;
};

export type AppointmentResponse = {
  id: number;
  businessId: number;
  serviceId: number;
  staffId: number;
  customerUserId: number | null;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientNotes: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  source: string;
};

export type UpdateAppointmentRequest = {
  serviceId: number;
  staffId: number;
  customerUserId: number | null;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientNotes?: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
};

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>
) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function searchOwnerAppointments(params: {
  userId: number;
  from?: string;
  to?: string;
  status?: AppointmentStatus;
  staffId?: number;
  serviceId?: number;
  search?: string;
}): Promise<AppointmentListItemResponse[]> {
  const url = buildUrl(`/api/appointments/owner/user/${params.userId}`, {
    from: params.from,
    to: params.to,
    status: params.status,
    staffId: params.staffId,
    serviceId: params.serviceId,
    search: params.search,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<AppointmentListItemResponse[]>(response);
}

export async function searchStaffAppointments(params: {
  userId: number;
  from?: string;
  to?: string;
  status?: AppointmentStatus;
  serviceId?: number;
  search?: string;
}): Promise<AppointmentListItemResponse[]> {
  const url = buildUrl(`/api/appointments/staff/user/${params.userId}`, {
    from: params.from,
    to: params.to,
    status: params.status,
    serviceId: params.serviceId,
    search: params.search,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<AppointmentListItemResponse[]>(response);
}

export async function searchCustomerAppointments(params: {
  userId: number;
  from?: string;
  to?: string;
  status?: AppointmentStatus;
  businessId?: number;
  serviceId?: number;
  search?: string;
}): Promise<AppointmentListItemResponse[]> {
  const url = buildUrl(`/api/appointments/customer/user/${params.userId}`, {
    from: params.from,
    to: params.to,
    status: params.status,
    businessId: params.businessId,
    serviceId: params.serviceId,
    search: params.search,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<AppointmentListItemResponse[]>(response);
}

export async function updateBusinessAppointment(
  businessId: number,
  appointmentId: number,
  payload: UpdateAppointmentRequest
): Promise<AppointmentResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/businesses/${businessId}/appointments/${appointmentId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse<AppointmentResponse>(response);
}

export async function updateAppointmentStatus(
  businessId: number,
  appointmentId: number,
  status: AppointmentStatus
): Promise<AppointmentResponse> {
  const url = buildUrl(
    `/api/businesses/${businessId}/appointments/${appointmentId}/status`,
    { value: status }
  );

  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  return handleResponse<AppointmentResponse>(response);
}