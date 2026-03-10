import { baseApi } from "./baseApi";

export interface EmbedTokenResponse {
  token?: string;
}

export const embedApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createEmbedToken: build.mutation<EmbedTokenResponse, string>({
      query: (id) => ({ url: `/api/v1/calculators/${id}/embed-token`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "EmbedTokens", id }],
    }),
    getEmbedToken: build.query<EmbedTokenResponse, string>({
      query: (id) => ({ url: `/api/v1/calculators/${id}/embed-token` }),
      providesTags: (_r, _e, id) => [{ type: "EmbedTokens", id }],
    }),
    deleteEmbedToken: build.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/calculators/${id}/embed-token`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "EmbedTokens", id }],
    }),
  }),
});

export const { useCreateEmbedTokenMutation, useGetEmbedTokenQuery, useLazyGetEmbedTokenQuery, useDeleteEmbedTokenMutation } = embedApi;
