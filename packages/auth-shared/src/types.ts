export type AuthRole = "USER" | "ADMIN" | "PREMIUM" | string;

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: AuthRole;
}

export interface AuthSessionResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName?: string;
}
