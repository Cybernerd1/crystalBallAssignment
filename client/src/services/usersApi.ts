import { httpClient } from './http';
import type { Pagination, User, UserInput, UserRole, UserStats, UserStatus } from '../types/user';

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  sort?: string;
}

export interface UsersListResponse {
  data: User[];
  pagination: Pagination;
}

export const usersApi = {
  /** GET /api/users — server-side search / filters / pagination. */
  async list(params: ListUsersParams = {}): Promise<UsersListResponse> {
    const query = new URLSearchParams();
    if (params.page && params.page > 1) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    if (params.sort && params.sort !== '-createdAt') query.set('sort', params.sort);

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const body = await httpClient<{ data: User[]; pagination: Pagination }>(`/users${suffix}`);
    return { data: body.data, pagination: body.pagination };
  },

  /** GET /api/users/:id */
  async get(id: string): Promise<User> {
    const body = await httpClient<{ data: User }>(`/users/${id}`);
    return body.data;
  },

  /** POST /api/users */
  async create(input: UserInput): Promise<User> {
    const body = await httpClient<{ data: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return body.data;
  },

  /** PUT /api/users/:id */
  async update(id: string, input: UserInput): Promise<User> {
    const body = await httpClient<{ data: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    return body.data;
  },

  /** DELETE /api/users/:id — server answers `{ data: { id } }` per the PRD. */
  async remove(id: string): Promise<{ id: string }> {
    const body = await httpClient<{ data: { id: string } }>(`/users/${id}`, {
      method: 'DELETE',
    });
    return body.data;
  },

  /** GET /api/users/stats */
  async stats(): Promise<UserStats> {
    const body = await httpClient<{ data: UserStats }>('/users/stats');
    return body.data;
  },
};
