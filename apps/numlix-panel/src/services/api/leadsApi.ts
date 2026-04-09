import { baseApi } from "./baseApi";

export interface LeadRow {
  id: string;
  calculatorId?: string;
  email?: string;
  name?: string;
  phone?: string;
  formValues?: Record<string, unknown>;
  resultValues?: Record<string, unknown>;
  createdAt?: string;
}

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listLeads: build.query<LeadRow[], void>({
      query: () => ({ url: "/api/v1/leads" }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Leads" as const, id })), { type: "Leads", id: "LIST" }]
          : [{ type: "Leads", id: "LIST" }],
    }),
  }),
});

export const { useListLeadsQuery } = leadsApi;
