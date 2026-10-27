import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';
import { formatDate } from '../../utils/format';
import type { User } from '../../types/user';

interface RecentUsersTableProps {
  users: User[];
  loading: boolean;
  onSelect: (user: User) => void;
}

function RecentSkeleton() {
  return (
    <div className="table-scroll" aria-hidden="true">
      <table className="table table--recent">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Joined</th>
            <th scope="col" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }, (_, index) => (
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
              <td>
                <span className="skeleton skeleton--date" />
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RecentUsersTable({ users, loading, onSelect }: RecentUsersTableProps) {
  if (loading) return <RecentSkeleton />;

  return (
    <div className="table-scroll">
      <table className="table table--recent">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col" className="col-joined">
              Joined
            </th>
            <th scope="col" className="table__actions-col">
              <span className="visually-hidden">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className="table__row"
              tabIndex={0}
              aria-label={`View details for ${user.name}`}
              onClick={() => onSelect(user)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(user);
                }
              }}
            >
              <td>
                <div className="table__user">
                  <Avatar name={user.name} size="sm" />
                  <div className="table__user-text">
                    <span className="table__user-name">{user.name}</span>
                    <span className="table__user-email">{user.email}</span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`badge badge--${user.role}`}>{user.role}</span>
              </td>
              <td>
                <span className={`status status--${user.status}`}>
                  <span className="status__dot" />
                  {user.status}
                </span>
              </td>
              <td className="table__muted table__date col-joined">{formatDate(user.createdAt)}</td>
              <td className="table__chevron">
                <Icon name="chevron-right" size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
