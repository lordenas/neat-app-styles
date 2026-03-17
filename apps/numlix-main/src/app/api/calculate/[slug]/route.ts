import { NextRequest, NextResponse } from "next/server";
import { isReadyForBackend } from "@/lib/calc-migration-inventory";
import type { CalcProxyRequest, CalcProxyResponse } from "@/lib/calc-api-types";

const CALC_API_BASE_URL = process.env.CALC_API_BASE_URL ?? "";
const CALC_API_KEY = process.env.CALC_API_KEY ?? "";

function getConfigError(): string | null {
  if (!CALC_API_BASE_URL) return "CALC_API_BASE_URL is not set";
  if (!CALC_API_KEY) return "CALC_API_KEY is not set";
  try {
    new URL(CALC_API_BASE_URL);
  } catch {
    return "CALC_API_BASE_URL is not a valid URL";
  }
  return null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!slug) {
    return NextResponse.json<CalcProxyResponse>(
      { ok: false, status: 400, message: "Missing slug" },
      { status: 400 }
    );
  }

  if (!isReadyForBackend(slug)) {
    return NextResponse.json<CalcProxyResponse>(
      { ok: false, status: 404, message: `Calculator "${slug}" has no backend endpoint` },
      { status: 404 }
    );
  }

  const configError = getConfigError();
  if (configError) {
    console.error("[calc-proxy]", configError);
    return NextResponse.json<CalcProxyResponse>(
      { ok: false, status: 503, message: "Calculation service unavailable" },
      { status: 503 }
    );
  }

  let body: CalcProxyRequest;
  try {
    body = (await request.json()) as CalcProxyRequest;
  } catch {
    return NextResponse.json<CalcProxyResponse>(
      { ok: false, status: 400, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body || typeof body.regionCode !== "string" || typeof body.input !== "object" || body.input === null) {
    return NextResponse.json<CalcProxyResponse>(
      { ok: false, status: 400, message: "Missing regionCode or input" },
      { status: 400 }
    );
  }

  const backendUrl = `${CALC_API_BASE_URL.replace(/\/$/, "")}/api/v1/calculate/${slug}`;

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CALC_API_KEY,
      },
      body: JSON.stringify({
        regionCode: body.regionCode,
        calculationDate: body.calculationDate,
        input: body.input,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = typeof data?.message === "string" ? data.message : res.statusText || "Backend error";
      if (res.status >= 500) {
        console.error("[calc-proxy]", slug, res.status, message);
      }
      return NextResponse.json<CalcProxyResponse>(
        { ok: false, status: res.status, message },
        { status: res.status }
      );
    }

    return NextResponse.json<CalcProxyResponse>({ ok: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    console.error("[calc-proxy]", slug, message);
    return NextResponse.json<CalcProxyResponse>(
      { ok: false, status: 502, message: "Calculation service unavailable" },
      { status: 502 }
    );
  }
}
