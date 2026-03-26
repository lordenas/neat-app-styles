import { type UserRole } from '../constants/user-role';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
