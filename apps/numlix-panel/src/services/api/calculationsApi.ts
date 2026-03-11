import { baseApi } from "./baseApi";

/** Backend list item shape (example from swagger) */
export interface CalculationRow {
  id: string;
  userId?: string;
  calculatorId?: string;
  regionId?: string;
  formulaId?: string;
  calculationDate?: string;
  inputPayload?: Record<string, unknown>;
  resultPayload?: Record<string, unknown>;
  shareToken?: string | null;
  token?: string;
}

/** View model for Dashboard (compatible with existing SavedCalculation UI) */
export interface SavedCalculationView {
  id: string;
  title: string;
  calculator_type: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
  share_token?: string | null;
}

function toView(row: CalculationRow): SavedCalculationView {
  return {
    id: row.id,
    title: row.calculatorId ?? "Расчёт",
    calculator_type: row.calculatorId ?? "credit",
    parameters: row.inputPayload ?? {},
    result: row.resultPayload ?? {},
    created_at: row.calculationDate ?? new Date().toISOString(),
    share_token: row.shareToken ?? row.token ?? null,
  };
}

export const calculationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCalculations: build.query<SavedCalculationView[], void>({
      query: () => ({ url: "/api/calculations" }),
      transformResponse: (raw: unknown) => {
        const arr = Array.isArray(raw) ? raw : [];
        return arr.map((item) => toView(item as CalculationRow));
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Calculations" as const, id })), { type: "Calculations", id: "LIST" }]
          : [{ type: "Calculations", id: "LIST" }],
    }),
    deleteCalculation: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/api/calculations/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Calculations", id }, { type: "Calculations", id: "LIST" }],
    }),
    shareCalculation: build.mutation<{ token: string; url: string }, string>({
      query: (id) => ({ url: `/api/calculations/${id}/share`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Calculations", id }, { type: "Calculations", id: "LIST" }],
    }),
  }),
});

export const { useListCalculationsQuery, useDeleteCalculationMutation, useShareCalculationMutation } = calculationsApi;
