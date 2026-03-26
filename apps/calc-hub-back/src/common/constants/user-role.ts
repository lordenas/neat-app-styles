export const USER_ROLES = ['USER', 'ADMIN', 'PREMIUM'] as const;

export type UserRole = (typeof USER_ROLES)[number];
