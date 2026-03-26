export type AppointmentStatus = "SCHEDULED" | "CANCELLED" | "NO_SHOW";

export type OwnerAppointmentRow = {
    id: number;
    startTime: string;
    endTime: string;
    customerName: string;
    businessName: string;
    serviceName: string;
    staffName: string;
    status: AppointmentStatus;
};

export type AppointmentListItem = {
  id: number;
  startTime: string;
  endTime: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  staffName: string;
  status: AppointmentStatus;
};

const API_BASE = "http://localhost:8080/api/appointments";

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export async function searchOwnerAppointments(params: {
  userId: number;
  from?: string;
  to?: string;
  status?: string;
  staffId?: number;
  serviceId?: number;
  search?: string;
}): Promise<AppointmentListItem[]> {
  const query = new URLSearchParams();

  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.staffId != null) query.set("staffId", String(params.staffId));
  if (params.serviceId != null) query.set("serviceId", String(params.serviceId));
  if (params.search && params.search.trim() !== "") query.set("search", params.search.trim());

  const response = await fetch(`${API_BASE}/owner/user/${params.userId}?${query.toString()}`);
  return handleResponse<AppointmentListItem[]>(response);
}

export async function searchStaffAppointments(params: {
  userId: number;
  from?: string;
  to?: string;
  status?: string;
  serviceId?: number;
  search?: string;
}): Promise<AppointmentListItem[]> {
  const query = new URLSearchParams();

  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.serviceId != null) query.set("serviceId", String(params.serviceId));
  if (params.search && params.search.trim() !== "") query.set("search", params.search.trim());

  const response = await fetch(`${API_BASE}/staff/user/${params.userId}?${query.toString()}`);
  return handleResponse<AppointmentListItem[]>(response);
}

export async function searchCustomerAppointments(params: {
  userId: number;
  from?: string;
  to?: string;
  status?: string;
  businessId?: number;
  serviceId?: number;
  search?: string;
}): Promise<AppointmentListItem[]> {
  const query = new URLSearchParams();

  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.businessId != null) query.set("businessId", String(params.businessId));
  if (params.serviceId != null) query.set("serviceId", String(params.serviceId));
  if (params.search && params.search.trim() !== "") query.set("search", params.search.trim());

  const response = await fetch(`${API_BASE}/customer/user/${params.userId}?${query.toString()}`);
  return handleResponse<AppointmentListItem[]>(response);
}