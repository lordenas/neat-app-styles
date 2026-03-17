/**
 * Types for backend calculation API (swagger CalculateRequestDto / response).
 * Used by server proxy and client hook.
 */

/** Request body for POST /api/v1/calculate/{slug} */
export interface CalcApiRequest {
  regionCode: string;
  calculationDate?: string;
  input: Record<string, unknown>;
}

/** Standard calculation response envelope from backend */
export interface CalcApiResponse<T = Record<string, unknown>> {
  calculator: string;
  region: string;
  formulaVersion: string;
  calculatedAt: string;
  input?: Record<string, unknown>;
  result: T;
}

/** Proxy request: client sends slug + same body as backend */
export interface CalcProxyRequest {
  regionCode: string;
  calculationDate?: string;
  input: Record<string, unknown>;
}

/** Proxy response: pass-through of backend response or error payload */
export type CalcProxyResponse<T = Record<string, unknown>> =
  | { ok: true; data: CalcApiResponse<T> }
  | { ok: false; status: number; message: string };
