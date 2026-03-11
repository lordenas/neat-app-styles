import { createSlice } from "@reduxjs/toolkit";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  tokens: AuthTokens | null;
}

const initialState: AuthState = {
  tokens: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(_, action: { payload: AuthTokens | null }) {
      return { tokens: action.payload };
    },
    clearTokens() {
      return initialState;
    },
  },
});

export const { setTokens, clearTokens } = authSlice.actions;
export default authSlice.reducer;
