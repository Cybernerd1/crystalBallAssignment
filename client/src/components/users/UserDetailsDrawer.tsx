import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '../../context/ToastContext';
import { usersApi } from '../../services/usersApi';
import type { User } from '../../types/user';
import { formatDateTime } from '../../utils/format';
import Avatar from '../ui/Avatar';
import Drawer from '../ui/Drawer';
import ErrorBanner from '../ui/ErrorBanner';
import Icon from '../ui/Icon';
import DeleteDialog from './DeleteDialog';

interface UserDetailsDrawerProps {
  userId: string | null;
  onClose: () => void;
  /** Called after a successful delete so the current page can refetch. */
  onChanged?: () => void;
}

/** Read-only user details in a side drawer, with edit and delete actions. */
export default function UserDetailsDrawer({ userId, onClose, onChanged }: UserDetailsDrawerProps) {
  const showToast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    usersApi
      .get(userId)
      .then((found) => {
        if (cancelled) return;
        setUser(found);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setUser(null);
        setError(err instanceof Error ? err.message : 'Failed to load this user');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, reloadToken]);

  async function confirmDelete() {
    if (!user) return;
    const name = user.name;
    await usersApi.remove(user._id);
    setDeleteOpen(false);
    showToast(`User "${name}" deleted`);
    onChanged?.();
    onClose();
  }

  return (
    <Drawer
      open={Boolean(userId)}
      onClose={onClose}
      className="user-drawer"
      ariaLabel="User details"
    >
      {loading ? (
        <>
          <header className="drawer__header user-drawer__header">
            <div className="user-drawer__identity">
              <span className="skeleton skeleton--avatar-lg" />
              <div>
                <span className="skeleton skeleton--name" />
                <span className="skeleton skeleton--email" />
              </div>
            </div>
          </header>
          <div className="drawer__body">
            <div className="detail-list" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="detail-row">
                  <span className="skeleton skeleton--label" />
                  <span className="skeleton skeleton--value" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : error || !user ? (
        <>
          <header className="drawer__header">
            <p className="drawer__eyebrow">User record</p>
            <h2 className="drawer__title">Details unavailable</h2>
            <p className="drawer__subtitle">This record could not be opened.</p>
          </header>
          <div className="drawer__body">
            <ErrorBanner
              message={error ?? 'User not found'}
              onRetry={() => setReloadToken((token) => token + 1)}
            />
          </div>
          <footer className="drawer__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Close
            </button>
          </footer>
        </>
      ) : (
        <>
          <header className="drawer__header user-drawer__header">
            <div className="user-drawer__identity">
              <Avatar name={user.name} size="lg" />
              <div className="user-drawer__identity-text">
                <p className="drawer__eyebrow">User record</p>
                <h2 className="user-drawer__name">{user.name}</h2>
                <p className="user-drawer__email">{user.email}</p>
              </div>
            </div>
            <div className="user-drawer__badges">
              <span className={`badge badge--${user.role}`}>{user.role}</span>
              <span className={`status status--${user.status}`}>
                <span className="status__dot" />
                {user.status}
              </span>
            </div>
          </header>

          <div className="drawer__body">
            <dl className="detail-list">
              <div className="detail-row">
                <dt>Phone</dt>
                <dd>{user.phone || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Member since</dt>
                <dd>{formatDateTime(user.createdAt)}</dd>
              </div>
              <div className="detail-row">
                <dt>Last updated</dt>
                <dd>{formatDateTime(user.updatedAt)}</dd>
              </div>
              <div className="detail-row">
                <dt>Record ID</dt>
                <dd className="mono user-drawer__id">{user._id}</dd>
              </div>
            </dl>

            <p className="user-drawer__note">
              <Icon name="database" size={14} />
              Stored in MongoDB and available through the users API.
            </p>
          </div>

          <footer className="drawer__footer user-drawer__footer">
            <Link
              to={`/users/${user._id}/edit`}
              className="btn btn--primary user-drawer__edit"
              onClick={onClose}
            >
              <Icon name="edit" size={15} />
              Edit user
            </Link>
            <button
              type="button"
              className="btn btn--danger-outline"
              onClick={() => setDeleteOpen(true)}
            >
              <Icon name="trash" size={15} />
              Delete
            </button>
          </footer>
        </>
      )}

      <DeleteDialog
        open={deleteOpen && Boolean(user)}
        user={user}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </Drawer>
  );
}
