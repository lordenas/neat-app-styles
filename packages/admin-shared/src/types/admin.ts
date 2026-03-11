export type AdminRole = "admin" | "super_admin";

export interface AdminGuardOptions {
  allowedRoles?: AdminRole[];
  unauthorizedPath?: string;
  forbiddenPath?: string;
}
