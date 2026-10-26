import { Link, useNavigate } from 'react-router-dom';

import { useUserStats, useUsers } from '../hooks/useUsers';
import { useTheme } from '../hooks/useTheme';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';
import ErrorBanner from '../components/ui/ErrorBanner';
import Icon, { type IconName } from '../components/ui/Icon';
import ThemeCustomizer from '../components/theme/ThemeCustomizer';
import { formatCount, formatDate } from '../utils/format';

interface StatCardProps {
  icon: IconName;
  label: string;
  value: string;
  meta: string;
  loading: boolean;
}

function StatCard({ icon, label, value, meta, loading }: StatCardProps) {
  return (
    <div className="card stat-card">
      <span className="stat-card__icon">
        <Icon name={icon} size={20} />
      </span>
      <div className="stat-card__content">
        <p className="stat-card__label">{label}</p>
        {loading ? (
          <span className="skeleton skeleton--value" />
        ) : (
          <p className="stat-card__value">{value}</p>
        )}
        {loading ? <span className="skeleton skeleton--meta" /> : <p className="stat-card__meta">{meta}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { state } = useTheme();
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useUserStats();
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
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__subtitle">Overview of your team's activity.</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('/users')}>
          <Icon name="users" size={16} />
          Manage users
        </button>
      </header>

      {statsError ? <ErrorBanner message={statsError} onRetry={retryAll} /> : null}

      <section className="stat-grid" aria-label="User statistics">
        <StatCard
          icon="users"
          label="Total users"
          value={stats ? formatCount(stats.total) : ''}
          meta="All records stored in MongoDB"
          loading={statsLoading}
        />
        <StatCard
          icon="check-circle"
          label="Active users"
          value={stats ? formatCount(stats.active) : ''}
          meta={stats ? `${activePercent}% of all users` : ''}
          loading={statsLoading}
        />
        <StatCard
          icon="plus-circle"
          label="New this week"
          value={stats ? formatCount(stats.newThisWeek) : ''}
          meta="Created in the last 7 days"
          loading={statsLoading}
        />
      </section>

      {recentError ? <ErrorBanner message={recentError} onRetry={retryAll} /> : null}

      <div className="dashboard-grid">
        <section className="card dashboard-card" aria-label="Recent users">
          <header className="card__header">
            <h2 className="card__title">Recent users</h2>
            <Link to="/users" className="card__link">
              View all
              <Icon name="arrow-right" size={14} />
            </Link>
          </header>

          {recentLoading ? (
            <div className="recent-list">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="recent-row">
                  <span className="skeleton skeleton--avatar" />
                  <span className="skeleton skeleton--text" />
                  <span className="skeleton skeleton--badge" />
                </div>
              ))}
            </div>
          ) : recent && recent.data.length > 0 ? (
            <ul className="recent-list">
              {recent.data.map((user) => (
                <li key={user._id} className="recent-row">
                  <Avatar name={user.name} size="sm" />
                  <div className="recent-row__text">
                    <span className="recent-row__name">{user.name}</span>
                    <span className="recent-row__email">{user.email}</span>
                  </div>
                  <span className={`badge badge--${user.role}`}>{user.role}</span>
                  <span className="recent-row__date">{formatDate(user.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="users"
              title="No users yet"
              message="Create your first user to see it here."
              action={
                <Link to="/users" className="btn btn--primary">
                  <Icon name="plus" size={16} />
                  Add user
                </Link>
              }
            />
          )}
        </section>

        <section className="card dashboard-card dashboard-card--theme" aria-label="Theme customizer">
          <header className="card__header">
            <h2 className="card__title">Theme customizer</h2>
            <span className={`card__chip card__chip--${state.preset}`}>{state.preset}</span>
          </header>
          <ThemeCustomizer />
        </section>
      </div>
    </div>
  );
}
