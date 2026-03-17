"use client";

import { useState, useEffect } from "react";
import type { CalcProxyRequest, CalcProxyResponse, CalcApiResponse } from "@/lib/calc-api-types";

export interface UseBackendCalculationResult<T = Record<string, unknown>> {
  data: CalcApiResponse<T> | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Fetches calculation from server proxy (/api/calculate/[slug]).
 * Cancels previous request when slug or request changes.
 * Use when calculator has backend endpoint (e.g. in numlix-main app).
 */
export function useBackendCalculation<T = Record<string, unknown>>(
  slug: string,
  request: CalcProxyRequest | null
): UseBackendCalculationResult<T> {
  const [data, setData] = useState<CalcApiResponse<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestKey = request ? `${slug}:${JSON.stringify(request)}` : "";

  useEffect(() => {
    if (!request || !requestKey) {
      setData(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    setError(null);
    setIsLoading(true);

    fetch(`/api/calculate/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: ac.signal,
    })
      .then((res) => res.json() as Promise<CalcProxyResponse<T>>)
      .then((json) => {
        if (json.ok) setData(json.data);
        else setError(json.message ?? "Calculation failed");
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Request failed");
        }
      })
      .finally(() => setIsLoading(false));

    return () => ac.abort();
  }, [requestKey, request, slug]);

  return { data, error, isLoading };
}
