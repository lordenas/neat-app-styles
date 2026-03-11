import { baseApi } from "./baseApi";
import { setTokens, clearTokens } from "@/store/slices/authSlice";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName?: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthTokensResponse, LoginDto>({
      query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setTokens(data));
        } catch {
          dispatch(clearTokens());
        }
      },
    }),
    register: build.mutation<AuthTokensResponse, RegisterDto>({
      query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setTokens(data));
        } catch {
          dispatch(clearTokens());
        }
      },
    }),
    refresh: build.mutation<AuthTokensResponse, RefreshDto>({
      query: (body) => ({ url: "/api/auth/refresh", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setTokens(data));
        } catch {
          dispatch(clearTokens());
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useRefreshMutation } = authApi;
