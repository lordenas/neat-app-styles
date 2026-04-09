/** Decode JWT payload without verification (for display only). */
export function decodeJwtPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload) as { sub?: string; email?: string };
  } catch {
    return null;
  }
}
