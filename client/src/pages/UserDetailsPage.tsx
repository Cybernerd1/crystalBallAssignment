import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Avatar from '../components/ui/Avatar';
import DeleteDialog from '../components/users/DeleteDialog';
import ErrorBanner from '../components/ui/ErrorBanner';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import { useToast } from '../context/ToastContext';
import { usersApi } from '../services/usersApi';
import { formatDateTime } from '../utils/format';
import type { User } from '../types/user';

/**
 * Dedicated page for a single record (`/users/:id`): read view plus actions —
 * "Edit user" routes to the editor page, "Delete" asks for explicit
 * confirmation before removing the record and returning to the list.
 */
export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    usersApi
      .get(id)
      .then((found) => {
        if (cancelled) return;
        setUser(found);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load this user');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const confirmDelete = useCallback(async () => {
    if (!user) return;
    const name = user.name;
    await usersApi.remove(user._id);
    setDeleteOpen(false);
    showToast(`User "${name}" deleted`);
    navigate('/users');
  }, [user, showToast, navigate]);

  if (loading) {
    return (
      <div className="page page--form">
        <div className="card form-loading">
          <Spinner size={20} label="Loading user" />
          <span>Loading user…</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page page--form">
        <ErrorBanner message={error ?? 'User not found'} onRetry={() => setReloadToken((t) => t + 1)} />
        <Link to="/users" className="btn btn--secondary">
          <Icon name="chevron-left" size={16} />
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="page page--form">
      <header className="page__header">
        <div>
          <Link to="/users" className="page__back-link">
            <Icon name="chevron-left" size={15} />
            Users
          </Link>
          <h1 className="page__title">{user.name}</h1>
          <p className="page__subtitle user-details__subtitle">
            <Avatar name={user.name} size="sm" />
            <span>{user.email}</span>
            <span className={`badge badge--${user.role}`}>{user.role}</span>
            <span className={`status status--${user.status}`}>
              <span className="status__dot" />
              {user.status}
            </span>
          </p>
        </div>

        <div className="page__actions">
          <Link to={`/users/${user._id}/edit`} className="btn btn--primary">
            <Icon name="edit" size={16} />
            Edit user
          </Link>
          <button type="button" className="btn btn--danger-outline" onClick={() => setDeleteOpen(true)}>
            <Icon name="trash" size={16} />
            Delete
          </button>
        </div>
      </header>

      <div className="card user-details-card">
        <dl className="details-drawer__fields">
          <div className="detail-row">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="detail-row">
            <dt>Role</dt>
            <dd className="details-drawer__badges">
              <span className={`badge badge--${user.role}`}>{user.role}</span>
            </dd>
          </div>
          <div className="detail-row">
            <dt>Status</dt>
            <dd>
              <span className={`status status--${user.status}`}>
                <span className="status__dot" />
                {user.status}
              </span>
            </dd>
          </div>
          <div className="detail-row">
            <dt>Phone</dt>
            <dd>{user.phone || '—'}</dd>
          </div>
          <div className="detail-row">
            <dt>Created</dt>
            <dd>{formatDateTime(user.createdAt)}</dd>
          </div>
          <div className="detail-row">
            <dt>Last updated</dt>
            <dd>{formatDateTime(user.updatedAt)}</dd>
          </div>
          <div className="detail-row">
            <dt>Record ID</dt>
            <dd className="mono details-drawer__id">{user._id}</dd>
          </div>
        </dl>
      </div>

      <DeleteDialog
        open={deleteOpen}
        user={user}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
