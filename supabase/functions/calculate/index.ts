import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, x-supabase-client-platform, x-supabase-client-platform-version",
};

// ---- VAT ----
function addVat(amountExcl: number, rate: number) {
  const vatAmount = Math.round((amountExcl * rate) / 100 * 100) / 100;
  return { amountExcl, vatAmount, amountWithVat: Math.round((amountExcl + vatAmount) * 100) / 100, rateUsed: rate };
}
function excludeVat(amountWithVat: number, rate: number) {
  if (rate >= 100) return { amountExcl: 0, vatAmount: amountWithVat, amountWithVat, rateUsed: rate };
  const amountExcl = Math.round(amountWithVat / (1 + rate / 100) * 100) / 100;
  return { amountExcl, vatAmount: Math.round((amountWithVat - amountExcl) * 100) / 100, amountWithVat, rateUsed: rate };
}

// ---- NDFL ----
const PROGRESSIVE_BRACKETS_2025 = [
  { limit: 2_400_000, rate: 0.13 },
  { limit: 5_000_000, rate: 0.15 },
  { limit: 20_000_000, rate: 0.18 },
  { limit: 50_000_000, rate: 0.20 },
  { limit: Infinity, rate: 0.22 },
];
function calcNdfl(income: number, ratePercent?: number) {
  if (ratePercent) return { income, tax: Math.round(income * ratePercent / 100 * 100) / 100, netIncome: Math.round(income * (1 - ratePercent / 100) * 100) / 100, rateUsed: ratePercent };
  let tax = 0, prev = 0;
  for (const b of PROGRESSIVE_BRACKETS_2025) {
    const taxable = Math.min(income, b.limit) - prev;
    if (taxable <= 0) break;
    tax += taxable * b.rate;
    prev = b.limit;
  }
  tax = Math.round(tax * 100) / 100;
  return { income, tax, netIncome: Math.round((income - tax) * 100) / 100, rateUsed: "progressive_2025" };
}

// ---- Mortgage (annuity) ----
function calcMortgage(amount: number, ratePercent: number, termMonths: number, downPayment = 0) {
  const principal = amount - downPayment;
  const r = ratePercent / 100 / 12;
  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    monthlyPayment = Math.round((principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1) * 100) / 100;
  }
  const totalPayment = Math.round(monthlyPayment * termMonths * 100) / 100;
  return { principal, monthlyPayment, totalPayment, totalInterest: Math.round((totalPayment - principal) * 100) / 100, termMonths, ratePercent };
}

// ---- Deposit ----
function calcDeposit(amount: number, ratePercent: number, termMonths: number, capitalize = true) {
  const r = ratePercent / 100;
  let result: number;
  if (capitalize) {
    result = amount * Math.pow(1 + r / 12, termMonths);
  } else {
    result = amount * (1 + r * termMonths / 12);
  }
  result = Math.round(result * 100) / 100;
  return { initialAmount: amount, finalAmount: result, interest: Math.round((result - amount) * 100) / 100, ratePercent, termMonths, capitalization: capitalize };
}

// ---- Auto Loan ----
function calcAutoLoan(carPrice: number, downPayment: number, ratePercent: number, termMonths: number) {
  const principal = carPrice - downPayment;
  const r = ratePercent / 100 / 12;
  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    monthlyPayment = Math.round((principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1) * 100) / 100;
  }
  const totalPayment = Math.round(monthlyPayment * termMonths * 100) / 100;
  return { carPrice, downPayment, principal, monthlyPayment, totalPayment, totalInterest: Math.round((totalPayment - principal) * 100) / 100 };
}

// ---- Fuel ----
function calcFuel(distance: number, consumptionPer100: number, pricePerLiter: number) {
  const liters = Math.round(distance / 100 * consumptionPer100 * 100) / 100;
  const cost = Math.round(liters * pricePerLiter * 100) / 100;
  return { distance, consumptionPer100, pricePerLiter, liters, cost };
}

// ---- Inflation ----
function calcInflation(amount: number, ratePercent: number, years: number) {
  const realValue = Math.round(amount / Math.pow(1 + ratePercent / 100, years) * 100) / 100;
  return { initialAmount: amount, realValue, loss: Math.round((amount - realValue) * 100) / 100, ratePercent, years };
}

// ---- Router ----
function routeCalculator(type: string, params: Record<string, unknown>) {
  const p = params as Record<string, number>;
  switch (type) {
    case "vat":
      if (params.mode === "exclude") return excludeVat(p.amount, p.rate ?? 20);
      return addVat(p.amount, p.rate ?? 20);
    case "ndfl":
      return calcNdfl(p.income, p.ratePercent);
    case "mortgage":
      return calcMortgage(p.amount, p.rate, p.termMonths, p.downPayment);
    case "deposit":
      return calcDeposit(p.amount, p.rate, p.termMonths, params.capitalize !== false);
    case "auto-loan":
      return calcAutoLoan(p.carPrice, p.downPayment ?? 0, p.rate, p.termMonths);
    case "fuel-consumption":
      return calcFuel(p.distance, p.consumptionPer100, p.pricePerLiter);
    case "inflation":
      return calcInflation(p.amount, p.rate, p.years);
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract API key from header or query
    const url = new URL(req.url);
    const apiKey = req.headers.get("x-api-key") || url.searchParams.get("api_key");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required. Pass X-Api-Key header." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract calculator type from path: /calculate/{type}
    const pathParts = url.pathname.split("/").filter(Boolean);
    const calcType = pathParts[pathParts.length - 1];

    if (!calcType || calcType === "calculate") {
      return new Response(JSON.stringify({ error: "Calculator type required in path: /calculate/{type}" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body params
    let params: Record<string, unknown> = {};
    if (req.method === "POST") {
      try { params = await req.json(); } catch { /* empty body */ }
    } else {
      url.searchParams.forEach((v, k) => {
        if (k !== "api_key") params[k] = isNaN(Number(v)) ? v : Number(v);
      });
    }

    // Validate API key via service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: keyRow, error: keyError } = await (supabase.from("api_keys" as any)
      .select("id, plan, requests_count, requests_limit, is_active, user_id")
      .eq("key", apiKey)
      .single());

    if (keyError || !keyRow) {
      return new Response(JSON.stringify({ error: "Invalid API key." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = keyRow as any;

    if (!row.is_active) {
      return new Response(JSON.stringify({ error: "API key is disabled." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (row.plan === "free" && row.requests_count >= row.requests_limit) {
      return new Response(JSON.stringify({ error: "Monthly request limit reached. Upgrade to Pro.", limit: row.requests_limit, used: row.requests_count }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Run calculation
    const result = routeCalculator(calcType, params);
    if (result === null) {
      return new Response(JSON.stringify({
        error: `Unknown calculator type: '${calcType}'.`,
        supported: ["vat", "ndfl", "mortgage", "deposit", "auto-loan", "fuel-consumption", "inflation"],
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Increment counter async
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("api_keys" as any).update({
      requests_count: row.requests_count + 1,
      last_used_at: new Date().toISOString(),
    }).eq("id", row.id));

    return new Response(JSON.stringify({
      success: true,
      type: calcType,
      result,
      meta: { plan: row.plan, requestsUsed: row.requests_count + 1, requestsLimit: row.plan === "pro" ? null : row.requests_limit },
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", detail: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
