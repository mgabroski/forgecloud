const API_BASE_URL = import.meta.env.VITE_API_URL as string;

if (!API_BASE_URL) {
  console.warn('VITE_API_URL is not set. API calls will fail.');
}

const ACCESS_TOKEN_KEY = 'fc_access_token';

export function setAccessToken(token: string) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore storage errors (SSR / private mode, etc.)
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status?: number;
  body?: unknown;
  isNetworkError: boolean;

  constructor(
    message: string,
    options?: { status?: number; body?: unknown; isNetworkError?: boolean },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.body = options?.body;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

function extractMessageFromBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const candidate = record.message;

  return typeof candidate === 'string' ? candidate : null;
}

function safeJsonParse(text: string): unknown {
  try {
    // JSON.parse returns any, but we immediately treat it as unknown
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {
    // Network / CORS / server-down etc.
    throw new ApiError('Cannot reach ForgeCloud API.', {
      isNetworkError: true,
    });
  });

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text().catch(() => '');
  const parsedBody: unknown = text ? safeJsonParse(text) : null;

  if (res.status === 401) {
    throw new ApiError('Unauthorized', { status: 401, body: parsedBody });
  }

  if (!res.ok) {
    const messageFromBody = extractMessageFromBody(parsedBody);

    throw new ApiError(messageFromBody || `Request failed with status ${res.status}`, {
      status: res.status,
      body: parsedBody,
    });
  }

  // Successful response
  return (parsedBody ?? ({} as T)) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body);
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PATCH', path, body);
}

export type AuthProvider = 'local' | 'google' | 'github' | 'other';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  authProvider: AuthProvider;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
