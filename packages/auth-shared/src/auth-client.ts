import { getAuthApiBaseUrl } from "./config";
import { clearAccessToken, getAccessToken, setAccessToken } from "./token-store";
import type { AuthSessionResponse, AuthUser, SignInPayload, SignUpPayload } from "./types";

function toErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
    if (Array.isArray(message) && message.length > 0) {
      const first = message[0];
      if (typeof first === "string") {
        return first;
      }
    }
  }
  return fallback;
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit, fallbackError: string): Promise<T> {
  const baseUrl = getAuthApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(toErrorMessage(payload, fallbackError));
  }
  return payload as T;
}

export async function login(payload: SignInPayload): Promise<AuthSessionResponse> {
  const data = await request<AuthSessionResponse>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify(payload) },
    "Login failed",
  );
  setAccessToken(data.accessToken);
  return data;
}

export async function register(payload: SignUpPayload): Promise<AuthSessionResponse> {
  const data = await request<AuthSessionResponse>(
    "/api/auth/register",
    { method: "POST", body: JSON.stringify(payload) },
    "Register failed",
  );
  setAccessToken(data.accessToken);
  return data;
}

export async function refreshSession(): Promise<AuthSessionResponse> {
  const data = await request<AuthSessionResponse>(
    "/api/auth/refresh",
    { method: "POST", body: JSON.stringify({}) },
    "Session refresh failed",
  );
  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<void> {
  await fetch(`${getAuthApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  clearAccessToken();
}

export async function getMe(accessToken?: string | null): Promise<AuthUser> {
  const token = accessToken ?? getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return request<AuthUser>("/api/auth/me", { method: "GET", headers }, "Failed to fetch user");
}

export async function bootstrapSession(): Promise<{ user: AuthUser | null; accessToken: string | null }> {
  try {
    const refreshed = await refreshSession();
    return { user: refreshed.user, accessToken: refreshed.accessToken };
  } catch {
    clearAccessToken();
    return { user: null, accessToken: null };
  }
}
