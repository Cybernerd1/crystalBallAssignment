import { useState } from 'react';
import { Link } from 'react-router-dom';

import ErrorBanner from '../components/ui/ErrorBanner';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import RecentUsersTable from '../components/users/RecentUsersTable';
import UserDetailsDrawer from '../components/users/UserDetailsDrawer';
import { useUserStats, useUsers } from '../hooks/useUsers';
import { formatCount } from '../utils/format';

export default function DashboardPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useUserStats();
  const {
    data: recent,
    loading: recentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = useUsers({ page: 1, limit: 8 });

  const activePercent =
    stats && stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  function retryAll() {
    refetchStats();
    refetchRecent();
  }

  return (
    <div className="page page--dashboard">
      <header className="page-head">
        <div className="page-head__copy">
          <p className="eyebrow">Workspace overview</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Keep track of your people and the latest changes.</p>
        </div>
        <div className="page-head__actions">
          <Link to="/users" className="btn btn--secondary">
            <Icon name="users" size={15} />
            View users
          </Link>
          <Link to="/users/new" className="btn btn--primary">
            <Icon name="plus" size={15} />
            Add user
          </Link>
        </div>
      </header>

      {statsError ? <ErrorBanner message={statsError} onRetry={retryAll} /> : null}

      <section className="dashboard-overview" aria-labelledby="overview-title">
        <header className="dashboard-section-head">
          <div>
            <p className="eyebrow">Live overview</p>
            <h2 id="overview-title">Today in your workspace</h2>
          </div>
          <span className="dashboard-section-head__note">
            <span className="status__dot status__dot--active" aria-hidden="true" />
            Synced with database
          </span>
        </header>

        <div className="metric-strip" aria-label="User statistics">
          <div className="metric metric--primary">
            <span className="metric__label">Total users</span>
            {statsLoading ? (
              <span className="skeleton skeleton--metric-lg" />
            ) : (
              <span className="metric__value">{stats ? formatCount(stats.total) : '—'}</span>
            )}
            <span className="metric__meta">All records in your workspace</span>
          </div>

          <div className="metric">
            <span className="metric__label">
              <span className="status__dot status__dot--active" aria-hidden="true" />
              Active users
            </span>
            {statsLoading ? (
              <span className="skeleton skeleton--metric" />
            ) : (
              <span className="metric__value">{stats ? formatCount(stats.active) : '—'}</span>
            )}
            <span className="metric__meta">{stats ? `${activePercent}% of total` : '—'}</span>
          </div>

          <div className="metric">
            <span className="metric__label">New this week</span>
            {statsLoading ? (
              <span className="skeleton skeleton--metric" />
            ) : (
              <span className="metric__value">{stats ? formatCount(stats.last7Days) : '—'}</span>
            )}
            <span className="metric__meta">Created in the last 7 days</span>
          </div>
        </div>
      </section>

      <section className="panel recent-panel" aria-labelledby="recent-users-title">
        <header className="panel__head">
          <div>
            <h2 className="panel__title" id="recent-users-title">
              Recent users
            </h2>
            <p className="panel__subtitle">The newest records in the directory.</p>
          </div>
          <Link to="/users" className="text-link">
            View all
            <Icon name="arrow-right" size={14} />
          </Link>
        </header>

        {recentError && !statsError ? (
          <div className="panel__feedback">
            <ErrorBanner message={recentError} onRetry={retryAll} />
          </div>
        ) : recentLoading ? (
          <RecentUsersTable users={[]} loading onSelect={() => undefined} />
        ) : recent && recent.data.length > 0 ? (
          <RecentUsersTable
            users={recent.data}
            loading={false}
            onSelect={(user) => setSelectedUserId(user._id)}
          />
        ) : recentError ? (
          <EmptyState
            icon="inbox"
            title="Recent users unavailable"
            message="The latest records could not be loaded. Use the banner above to retry."
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
      </section>

      <UserDetailsDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onChanged={retryAll}
      />
    </div>
  );
}
