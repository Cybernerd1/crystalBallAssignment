import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import DeleteDialog from '../components/users/DeleteDialog';
import Pagination from '../components/users/Pagination';
import UserDetailsDrawer from '../components/users/UserDetailsDrawer';
import UsersTable from '../components/users/UsersTable';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import Icon from '../components/ui/Icon';
import Input from '../components/ui/Input';
import { useToast } from '../context/ToastContext';
import { useUsers } from '../hooks/useUsers';
import { usersApi } from '../services/usersApi';
import type { User, UserRole, UserStatus } from '../types/user';
import { formatCount } from '../utils/format';

const LIMITS = [8, 16, 32];
const SORTS = ['-createdAt', 'createdAt', 'name', '-name'] as const;

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

interface UpdateOptions {
  resetPage?: boolean;
  /** Close the details drawer when the query it came from changes. */
  dropUser?: boolean;
  replace?: boolean;
}

export default function UsersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showToast = useToast();

  // ---- URL-backed view state ---------------------------------------------
  const search = searchParams.get('search') ?? '';
  const role = isRole(searchParams.get('role') ?? '') ? (searchParams.get('role') as UserRole) : '';
  const status = isStatus(searchParams.get('status') ?? '')
    ? (searchParams.get('status') as UserStatus)
    : '';
  const sort = SORTS.includes((searchParams.get('sort') ?? '-createdAt') as (typeof SORTS)[number])
    ? (searchParams.get('sort') ?? '-createdAt')
    : '-createdAt';
  const limit = LIMITS.includes(toIntOr(searchParams.get('limit'), 8))
    ? toIntOr(searchParams.get('limit'), 8)
    : 8;
  const page = toIntOr(searchParams.get('page'), 1);
  const selectedUserId = searchParams.get('user');

  const { data, loading, error, refetch } = useUsers({
    page,
    limit,
    search,
    role,
    status,
    sort,
  });

  const updateParams = useCallback(
    (changes: Record<string, string | null>, options: UpdateOptions = {}) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === '') next.delete(key);
            else next.set(key, value);
          }
          if (options.resetPage) next.delete('page');
          if (options.dropUser) next.delete('user');
          return next;
        },
        { replace: options.replace ?? true },
      );
    },
    [setSearchParams],
  );

  // ---- Debounced search input --------------------------------------------
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (searchInput === search) return;
    const timer = window.setTimeout(() => {
      updateParams(
        { search: searchInput.trim() || null },
        { resetPage: true, dropUser: true },
      );
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // ---- Step back when a page empties out (e.g. last row deleted) ----------
  useEffect(() => {
    if (loading || !data?.pagination) return;
    if (data.data.length > 0 || data.pagination.page <= 1) return;
    const target = Math.max(1, Math.min(data.pagination.totalPages, data.pagination.page - 1));
    updateParams({ page: String(target) }, { dropUser: true });
  }, [loading, data, updateParams]);

  // ---- Row / drawer / delete plumbing -------------------------------------
  const openUser = useCallback(
    (user: User) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set('user', user._id);
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  const closeUser = useCallback(() => {
    updateParams({ user: null }, { replace: true });
  }, [updateParams]);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    const deletedId = deleteTarget._id;
    await usersApi.remove(deletedId);
    setDeleteTarget(null);
    refetch();
    showToast(`User "${name}" deleted`);
  }

  function clearFilters() {
    updateParams({ search: null, role: null, status: null, page: null, user: null });
    setSearchInput('');
  }

  // ---- Derived values ------------------------------------------------------
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const currentPage = pagination?.page ?? page;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const rangeEnd = Math.min(total, currentPage * limit);
  const hasFilters = Boolean(search || role || status);
  const isInitialLoading = loading && !data;

  const headerSubtitle = isInitialLoading
    ? 'Loading the directory…'
    : error && !data
      ? 'The directory could not be loaded.'
      : hasFilters
        ? `${formatCount(total)} matching ${total === 1 ? 'record' : 'records'}`
        : `${formatCount(total)} ${total === 1 ? 'person' : 'people'} in this workspace`;

  return (
    <div className="page page--users">
      <header className="page-head">
        <div className="page-head__copy">
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{headerSubtitle}</p>
        </div>
        <div className="page-head__actions">
          <Link to="/users/new" className="btn btn--primary">
            <Icon name="plus" size={15} />
            Add user
          </Link>
        </div>
      </header>

      {error && data ? <ErrorBanner message={error} onRetry={refetch} /> : null}

      <div className="users-toolbar" role="search">
        <div className="search-field">
          <Icon name="search" size={16} className="search-field__icon" />
          <Input
            type="search"
            className="search-field__input"
            placeholder="Search by name or email"
            aria-label="Search users by name or email"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          {searchInput ? (
            <button
              type="button"
              className="search-field__clear"
              aria-label="Clear search"
              onClick={() => {
                setSearchInput('');
                updateParams({ search: null }, { resetPage: true, dropUser: true });
              }}
            >
              <Icon name="close" size={13} />
            </button>
          ) : null}
        </div>

        <div className="filter-group">
          <label className={`filter ${role ? 'filter--active' : ''}`}>
            <span className="filter__label">Role</span>
            <span className="filter__control-wrap">
              <select
                className="filter__control"
                aria-label="Filter by role"
                value={role}
                onChange={(event) =>
                  updateParams(
                    { role: event.target.value || null },
                    { resetPage: true, dropUser: true },
                  )
                }
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <Icon name="chevron-down" size={13} className="filter__chevron" />
            </span>
          </label>

          <label className={`filter ${status ? 'filter--active' : ''}`}>
            <span className="filter__label">Status</span>
            <span className="filter__control-wrap">
              <select
                className="filter__control"
                aria-label="Filter by status"
                value={status}
                onChange={(event) =>
                  updateParams(
                    { status: event.target.value || null },
                    { resetPage: true, dropUser: true },
                  )
                }
              >
                <option value="">Any status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Icon name="chevron-down" size={13} className="filter__chevron" />
            </span>
          </label>

          <label className="filter filter--sort">
            <span className="filter__label">Sort</span>
            <span className="filter__control-wrap">
              <select
                className="filter__control"
                aria-label="Sort users"
                value={sort}
                onChange={(event) =>
                  updateParams(
                    { sort: event.target.value === '-createdAt' ? null : event.target.value },
                    { resetPage: true, dropUser: true },
                  )
                }
              >
                <option value="-createdAt">Newest first</option>
                <option value="createdAt">Oldest first</option>
                <option value="name">Name A–Z</option>
                <option value="-name">Name Z–A</option>
              </select>
              <Icon name="chevron-down" size={13} className="filter__chevron" />
            </span>
          </label>
        </div>

        {hasFilters ? (
          <button type="button" className="btn btn--ghost btn--sm users-toolbar__clear" onClick={clearFilters}>
            Clear filters
          </button>
        ) : null}
      </div>

      <section className="panel users-panel" aria-label="User directory">
        {isInitialLoading ? (
          <div className="table-scroll" aria-hidden="true">
            <table className="table table--users">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="col-phone">
                    Phone
                  </th>
                  <th scope="col" className="col-joined">
                    Joined
                  </th>
                  <th scope="col" className="table__actions-col" />
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, index) => (
                  <tr key={index}>
                    <td>
                      <div className="table__user">
                        <span className="skeleton skeleton--avatar" />
                        <div className="table__user-text">
                          <span className="skeleton skeleton--name" />
                          <span className="skeleton skeleton--email" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="skeleton skeleton--badge" />
                    </td>
                    <td>
                      <span className="skeleton skeleton--status" />
                    </td>
                    <td className="col-phone">
                      <span className="skeleton skeleton--text" />
                    </td>
                    <td className="col-joined">
                      <span className="skeleton skeleton--date" />
                    </td>
                    <td className="table__actions" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : data && data.data.length > 0 ? (
          <UsersTable
            users={data.data}
            selectedUserId={selectedUserId}
            sort={sort}
            onSort={(nextSort) =>
              updateParams(
                { sort: nextSort === '-createdAt' ? null : nextSort },
                { resetPage: true, dropUser: true },
              )
            }
            onRowClick={openUser}
            onEdit={(user) => navigate(`/users/${user._id}/edit`)}
            onDelete={setDeleteTarget}
          />
        ) : hasFilters ? (
          <EmptyState
            icon="search"
            title="No users match your filters"
            message="Try a different search term, role or status."
            action={
              <button type="button" className="btn btn--secondary" onClick={clearFilters}>
                Clear filters
              </button>
            }
          />
        ) : error ? (
          <EmptyState
            icon="inbox"
            title="Directory unavailable"
            message="The users could not be loaded right now."
            action={
              <button type="button" className="btn btn--secondary" onClick={refetch}>
                Try again
              </button>
            }
          />
        ) : (
          <EmptyState
            icon="users"
            title="No users yet"
            message="Create the first record and it will appear here."
            action={
              <Link to="/users/new" className="btn btn--primary">
                <Icon name="plus" size={15} />
                Add user
              </Link>
            }
          />
        )}

        {pagination && total > 0 ? (
          <footer className="users-footer">
            <p className="users-footer__count">
              {rangeStart > 0
                ? `Showing ${formatCount(rangeStart)}–${formatCount(rangeEnd)} of ${formatCount(total)}`
                : 'No users to show'}
            </p>
            <div className="users-footer__controls">
              <label className="users-footer__limit">
                <span>Rows</span>
                <span className="users-footer__limit-wrap">
                  <select
                    className="filter__control filter__control--compact"
                    aria-label="Rows per page"
                    value={String(limit)}
                    onChange={(event) =>
                      updateParams(
                        { limit: event.target.value === '8' ? null : event.target.value },
                        { resetPage: true },
                      )
                    }
                  >
                    {LIMITS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" size={12} className="filter__chevron" />
                </span>
              </label>
              <Pagination
                page={currentPage}
                totalPages={pagination.totalPages}
                onChange={(next) => updateParams({ page: next === 1 ? null : String(next) })}
              />
            </div>
          </footer>
        ) : null}
      </section>

      <UserDetailsDrawer
        userId={selectedUserId}
        onClose={closeUser}
        onChanged={refetch}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
