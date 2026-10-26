import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import DeleteDialog from '../components/users/DeleteDialog';
import Pagination from '../components/users/Pagination';
import UsersTable from '../components/users/UsersTable';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import Icon from '../components/ui/Icon';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useUsers } from '../hooks/useUsers';
import { usersApi } from '../services/usersApi';
import { useToast } from '../context/ToastContext';
import type {
  Pagination as PaginationMeta,
  User,
  UserRole,
  UserStatus,
} from '../types/user';
import { formatCount } from '../utils/format';

const LIMITS = [8, 16, 32];
const SORTS = ['-createdAt', 'name', '-name'] as const;

function toIntOr(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isRole(value: string): value is UserRole {
  return value === 'admin' || value === 'editor' || value === 'viewer';
}

function isStatus(value: string): value is UserStatus {
  return value === 'active' || value === 'inactive';
}

export default function UsersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showToast = useToast();
  const { data, loading, error, refetch } = useUsers({
    page: toIntOr(searchParams.get('page'), 1),
    limit: LIMITS.includes(toIntOr(searchParams.get('limit'), 8)) ? toIntOr(searchParams.get('limit'), 8) : 8,
    search: searchParams.get('search') ?? '',
    role: isRole(searchParams.get('role') ?? '') ? (searchParams.get('role') as UserRole) : '',
    status: isStatus(searchParams.get('status') ?? '') ? (searchParams.get('status') as UserStatus) : '',
    sort: SORTS.includes((searchParams.get('sort') ?? '-createdAt') as (typeof SORTS)[number])
      ? (searchParams.get('sort') ?? '-createdAt')
      : '-createdAt',
  });

  // ---- URL state helpers -------------------------------------------------
  const updateParams = useCallback(
    (changes: Record<string, string | null>, options?: { resetPage?: boolean }) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '') next.delete(key);
            else next.set(key, value);
          }
          if (options?.resetPage) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // ---- Debounced search input --------------------------------------------
  const search = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(search);

  // Stay in sync when the topbar search navigates here.
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (searchInput === search) return;
    const timer = window.setTimeout(() => {
      updateParams({ search: searchInput.trim() || null }, { resetPage: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // ---- Step back when a page empties out (e.g. last row deleted) ----------
  useEffect(() => {
    if (loading || !data || !data.pagination) return;
    if (data.data.length > 0 || data.pagination.page <= 1) return;
    const target = Math.max(1, Math.min(data.pagination.totalPages, data.pagination.page - 1));
    updateParams({ page: String(target) });
  }, [loading, data, updateParams]);

  // ---- Delete confirmation ----------------------------------------------
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    await usersApi.remove(deleteTarget._id);
    setDeleteTarget(null);
    refetch();
    showToast(`User "${name}" deleted`);
  }

  // ---- Derived view values -------------------------------------------------
  const pagination: PaginationMeta | undefined = data?.pagination;
  const total = pagination?.total ?? 0;
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 8;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(total, page * limit);

  const hasFilters = Boolean(search || searchParams.get('role') || searchParams.get('status'));

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Users</h1>
          <p className="page__subtitle">Create, manage and organize your team members.</p>
        </div>
        <Link to="/users/new" className="btn btn--primary">
          <Icon name="plus" size={16} />
          Add user
        </Link>
      </header>

      {error ? <ErrorBanner message={error} onRetry={refetch} /> : null}

      <div className="card users-card">
        <div className="users-toolbar">
          <div className="users-toolbar__search">
            <Icon name="search" size={16} />
            <Input
              type="search"
              placeholder="Search by name or email"
              aria-label="Search users by name or email"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <Select
            aria-label="Filter by role"
            value={searchParams.get('role') ?? ''}
            onChange={(event) => updateParams({ role: event.target.value || null }, { resetPage: true })}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </Select>

          <Select
            aria-label="Filter by status"
            value={searchParams.get('status') ?? ''}
            onChange={(event) => updateParams({ status: event.target.value || null }, { resetPage: true })}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          <Select
            aria-label="Sort users"
            value={searchParams.get('sort') ?? '-createdAt'}
            onChange={(event) => updateParams({ sort: event.target.value || null }, { resetPage: true })}
          >
            <option value="-createdAt">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="-name">Name Z–A</option>
          </Select>

          <Select
            aria-label="Rows per page"
            value={String(limit)}
            onChange={(event) => updateParams({ limit: event.target.value }, { resetPage: true })}
          >
            {LIMITS.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </Select>

          {hasFilters ? (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setSearchParams({}, { replace: true })}
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="table-scroll" aria-hidden="true">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Joined</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="table__user">
                        <span className="skeleton skeleton--avatar" />
                        <span className="skeleton skeleton--text" />
                      </div>
                    </td>
                    <td>
                      <span className="skeleton skeleton--badge" />
                    </td>
                    <td>
                      <span className="skeleton skeleton--badge" />
                    </td>
                    <td>
                      <span className="skeleton skeleton--text" />
                    </td>
                    <td>
                      <span className="skeleton skeleton--text" />
                    </td>
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : data && data.data.length > 0 ? (
          <UsersTable
            users={data.data}
            onRowClick={(user) => navigate(`/users/${user._id}`)}
            onEdit={(user) => navigate(`/users/${user._id}/edit`)}
            onDelete={setDeleteTarget}
          />
        ) : hasFilters ? (
          <EmptyState
            icon="search"
            title="No users match your filters"
            message="Try a different search term or clear the filters."
            action={
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <EmptyState
            icon="users"
            title="No users yet"
            message="Users you create will appear here."
            action={
              <Link to="/users/new" className="btn btn--primary">
                <Icon name="plus" size={16} />
                Add user
              </Link>
            }
          />
        )}
      </div>

      <div className="users-footer">
        <p className="muted users-footer__count">
          {rangeStart > 0
            ? `Showing ${rangeStart}–${formatCount(rangeEnd)} of ${formatCount(total)} users`
            : 'No users to show'}
        </p>
        {pagination ? (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onChange={(next) => updateParams({ page: String(next) })}
          />
        ) : null}
      </div>

      <DeleteDialog
        open={deleteTarget !== null}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
