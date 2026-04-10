export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  university?: string;
  department?: string;
  yearOfStudy?: number;
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  university?: string;
  department?: string;
  yearOfStudy?: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function requestAuth(path: '/login' | '/register', payload: LoginPayload | RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AuthResponse;
}

export const authApi = {
  login(payload: LoginPayload) {
    return requestAuth('/login', payload);
  },
  register(payload: RegisterPayload) {
    return requestAuth('/register', payload);
  },
};
