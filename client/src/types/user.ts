export type UserRole = 'admin' | 'member' | 'editor';
export type UserStatus = 'active' | 'inactive';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload sent by the create/edit form. */
export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** GET /api/users/stats response payload. */
export interface UserStats {
  total: number;
  active: number;
  newThisWeek: number;
  generatedAt: string;
}
