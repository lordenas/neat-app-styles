type EnvMap = Record<string, string | undefined>;

/**
 * Vite заменяет только прямые обращения `import.meta.env.VITE_*` на этапе сборки.
 * Чтение через промежуточную переменную оставляет пустой объект → падаем в localhost fallback.
 */
function readNodeEnv(): EnvMap | undefined {
  if (typeof globalThis === "undefined" || !("process" in globalThis)) {
    return undefined;
  }
  return (globalThis as { process?: { env?: EnvMap } }).process?.env;
}

let explicitApiBaseUrl: string | null = null;

/**
 * Страница на https, а в .env остался `http://api…` → mixed content. Поднимаем до https (не трогаем localhost).
 */
export function normalizeApiBaseUrlForBrowser(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (typeof globalThis === "undefined" || !("location" in globalThis)) {
    return trimmed;
  }
  const loc = (globalThis as typeof globalThis & { location?: { protocol?: string } }).location;
  if (loc?.protocol !== "https:") {
    return trimmed;
  }
  if (!trimmed.startsWith("http://")) {
    return trimmed;
  }
  const rest = trimmed.slice("http://".length);
  if (rest.startsWith("localhost") || rest.startsWith("127.0.0.1")) {
    return trimmed;
  }
  return `https://${rest}`;
}

export function setAuthApiBaseUrl(url: string): void {
  explicitApiBaseUrl = normalizeApiBaseUrlForBrowser(url.replace(/\/$/, ""));
}

export function getAuthApiBaseUrl(): string {
  if (explicitApiBaseUrl) {
    return explicitApiBaseUrl;
  }
  const nodeEnv = readNodeEnv();
  const value =
    import.meta.env.VITE_API_URL ??
    import.meta.env.VITE_AUTH_API_URL ??
    nodeEnv?.NEXT_PUBLIC_API_URL ??
    nodeEnv?.NUMLIX_API_URL ??
    "https://api.numlix.local";
  return normalizeApiBaseUrlForBrowser(value.replace(/\/$/, ""));
}

export interface DomainRoutes {
  mainHome: string;
  panelAuth: string;
  panelDashboard: string;
  adminLogin: string;
  adminDashboard: string;
}

export function getDomainRoutes(): DomainRoutes {
  const nodeEnv = readNodeEnv();
  const main =
    import.meta.env.VITE_MAIN_URL ?? nodeEnv?.NUMLIX_MAIN_URL ?? "https://numlix.local";
  const panel =
    import.meta.env.VITE_PANEL_URL ?? nodeEnv?.NUMLIX_PANEL_URL ?? "https://panel.numlix.local";
  const admin =
    import.meta.env.VITE_ADMIN_URL ?? nodeEnv?.NUMLIX_ADMIN_URL ?? "https://admin.numlix.local";
  return {
    mainHome: main,
    panelAuth: `${panel}/auth`,
    panelDashboard: `${panel}/dashboard`,
    adminLogin: `${admin}/admin/login`,
    adminDashboard: `${admin}/admin`,
  };
}
