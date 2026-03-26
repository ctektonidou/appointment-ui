export type CustomerDashboardAppointment = {
  id: number;
  startTime: string;
  endTime: string;
  clientName: string;
  status: string;
  businessId: number;
  serviceId: number;
  staffId: number;
};

export type CustomerDashboardResponse = {
  todayCount: number;
  weekCount: number;
  cancelRate: number;
  todayAppointments: CustomerDashboardAppointment[];
};

export type DashboardStatsResponse = {
  todayCount: number;
  weekCount: number;
  cancelRate: number;
  noShowsCount: number;
};

const BASE_URL = "http://localhost:8080/api/dashboard";

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export async function getCustomerDashboard(
  userId: number
): Promise<CustomerDashboardResponse> {
  const response = await fetch(`${BASE_URL}/customer/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<CustomerDashboardResponse>(response);
}

export async function getCustomerStats(
  userId: number
): Promise<DashboardStatsResponse> {
  const response = await fetch(`${BASE_URL}/customer/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<DashboardStatsResponse>(response);
}

export async function getStaffStats(
  userId: number
): Promise<DashboardStatsResponse> {
  const response = await fetch(`${BASE_URL}/staff/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<DashboardStatsResponse>(response);
}

export async function getOwnerStats(
  userId: number
): Promise<DashboardStatsResponse> {
  const response = await fetch(`${BASE_URL}/owner/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<DashboardStatsResponse>(response);
}