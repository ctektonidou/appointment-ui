export type LoginRequest = {
  email: string;
  password: string;
};

export type CustomerSignupRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type StaffSignupRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessCode: string;
  phone?: string;
  colorHex?: string;
};

export type BusinessSignupRequest = {
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  password: string;
  businessName: string;
  industryId: string;
  phone: string;
  businessEmail: string;
  timezone: string;
  address: string;
  logoUrl?: string;
};

export type AuthResponse = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  message: string;
  businessId: number;
  staffId: number;
};

const BASE_URL = "http://localhost:8080/api/auth";

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleResponse<AuthResponse>(response);
}

export async function signupCustomer(
  request: CustomerSignupRequest
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/signup/customer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleResponse<AuthResponse>(response);
}

export async function signupStaff(
  request: StaffSignupRequest
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/signup/staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleResponse<AuthResponse>(response);
}

export async function signupBusiness(
  request: BusinessSignupRequest
): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/signup/business`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return handleResponse<AuthResponse>(response);
}