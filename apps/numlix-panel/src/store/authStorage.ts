import type { AuthTokens } from "./slices/authSlice";

const STORAGE_KEY = "numlix_auth_tokens";

export function loadStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthTokens;
    if (data?.accessToken && data?.refreshToken) return data;
    return null;
  } catch {
    return null;
  }
}

export function saveStoredTokens(tokens: AuthTokens | null): void {
  if (typeof window === "undefined") return;
  if (tokens) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
