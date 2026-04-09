import { baseApi } from "./baseApi";

export interface ApiKeyRow {
  id: string;
  name: string;
  createdAt: string;
  apiKey?: string;
}

export interface CreateApiKeyDto {
  name: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  apiKey: string;
}

export const apiKeysApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listApiKeys: build.query<ApiKeyRow[], void>({
      query: () => ({ url: "/api/api-keys" }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "ApiKeys" as const, id })), { type: "ApiKeys", id: "LIST" }]
          : [{ type: "ApiKeys", id: "LIST" }],
    }),
    createApiKey: build.mutation<CreateApiKeyResponse, CreateApiKeyDto>({
      query: (body) => ({ url: "/api/api-keys", method: "POST", body }),
      invalidatesTags: [{ type: "ApiKeys", id: "LIST" }],
    }),
    deleteApiKey: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/api/api-keys/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [{ type: "ApiKeys", id }, { type: "ApiKeys", id: "LIST" }],
    }),
  }),
});

export const { useListApiKeysQuery, useCreateApiKeyMutation, useDeleteApiKeyMutation } = apiKeysApi;
