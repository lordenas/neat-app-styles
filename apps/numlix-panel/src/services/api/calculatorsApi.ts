import { baseApi } from "./baseApi";
import type { CustomCalculator, CalcPage, CalcField } from "@/types/custom-calc";

export interface ListCalculatorsParams {
  limit?: number;
  page?: number;
}

/** Backend may return camelCase; we normalize to CustomCalculator */
function toCalculator(raw: Record<string, unknown>): CustomCalculator {
  return {
    id: String(raw.id ?? raw.calculatorId ?? ""),
    slug: String(raw.slug ?? ""),
    title: String(raw.title ?? ""),
    description: raw.description != null ? String(raw.description) : undefined,
    pages: Array.isArray(raw.pages) ? (raw.pages as CalcPage[]) : undefined,
    fields: Array.isArray(raw.fields) ? (raw.fields as CalcField[]) : [],
    theme: raw.theme && typeof raw.theme === "object" ? (raw.theme as CustomCalculator["theme"]) : undefined,
    isPublic: Boolean(raw.isPublic ?? raw.is_public),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? new Date().toISOString()),
  };
}

export const calculatorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCalculators: build.query<CustomCalculator[], ListCalculatorsParams | void>({
      query: (params) => ({
        url: "/api/v1/calculators",
        params: params ?? {},
      }),
      transformResponse: (raw: unknown) => {
        const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
        const arr = Array.isArray(raw)
          ? raw
          : obj && "data" in obj && Array.isArray(obj.data)
            ? obj.data
            : obj && "items" in obj && Array.isArray(obj.items)
              ? obj.items
              : [];
        return arr.map((item) => toCalculator(item as Record<string, unknown>));
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Calculators" as const, id })), { type: "Calculators", id: "LIST" }]
          : [{ type: "Calculators", id: "LIST" }],
    }),
    getCalculator: build.query<CustomCalculator, string>({
      query: (id) => ({ url: `/api/v1/calculators/${id}` }),
      transformResponse: (raw: unknown) => toCalculator((raw ?? {}) as Record<string, unknown>),
      providesTags: (_result, _err, id) => [{ type: "Calculator", id }],
    }),
    getPublicCalculator: build.query<CustomCalculator, string>({
      query: (slug) => ({ url: `/api/v1/calculators/public/${slug}` }),
      transformResponse: (raw: unknown) => toCalculator((raw ?? {}) as Record<string, unknown>),
      providesTags: (_result, _err, slug) => [{ type: "Calculator", id: `public-${slug}` }],
    }),
    createCalculator: build.mutation<CustomCalculator, { title: string; description?: string; isPublic?: boolean; theme?: CustomCalculator["theme"]; pages?: CalcPage[]; fields: CalcField[] }>({
      query: (body) => ({ url: "/api/v1/calculators", method: "POST", body }),
      transformResponse: (raw: unknown) => toCalculator((raw ?? {}) as Record<string, unknown>),
      invalidatesTags: [{ type: "Calculators", id: "LIST" }],
    }),
    updateCalculator: build.mutation<CustomCalculator, { id: string; title?: string; description?: string; isPublic?: boolean; theme?: CustomCalculator["theme"]; pages?: CalcPage[]; fields?: CalcField[] }>({
      query: ({ id, ...body }) => ({ url: `/api/v1/calculators/${id}`, method: "PATCH", body }),
      transformResponse: (raw: unknown) => toCalculator((raw ?? {}) as Record<string, unknown>),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Calculator", id }, { type: "Calculators", id: "LIST" }],
    }),
    deleteCalculator: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/calculators/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [{ type: "Calculator", id }, { type: "Calculators", id: "LIST" }],
    }),
    evaluateFormula: build.mutation<{ result: number }, { formula: string; values: Record<string, number> }>({
      query: (body) => ({ url: "/api/v1/calculators/evaluate", method: "POST", body }),
    }),
  }),
});

export const {
  useListCalculatorsQuery,
  useGetCalculatorQuery,
  useGetPublicCalculatorQuery,
  useCreateCalculatorMutation,
  useUpdateCalculatorMutation,
  useDeleteCalculatorMutation,
  useEvaluateFormulaMutation,
} = calculatorsApi;
