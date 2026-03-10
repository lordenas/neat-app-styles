import { lazy } from "react";

export const ADMIN_ROUTES = {
  login: "/admin/login",
  dashboard: "/admin",
  cpa: "/admin/cpa",
  users: "/admin/users",
  userDetail: "/admin/users/:id",
  forbidden: "/admin/forbidden",
} as const;

export const adminRouteTo = {
  userDetail: (id: string) => `/admin/users/${id}`,
} as const;

export const adminPages = {
  AdminLogin: lazy(() => import("./pages/AdminLogin")),
  AdminDashboard: lazy(() => import("./pages/AdminDashboard")),
  AdminCpa: lazy(() => import("./pages/AdminCpa")),
  AdminUsers: lazy(() => import("./pages/AdminUsers")),
  AdminUserDetail: lazy(() => import("./pages/AdminUserDetail")),
  AdminForbidden: lazy(() => import("./pages/AdminForbidden")),
};
