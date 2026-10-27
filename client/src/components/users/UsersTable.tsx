import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';
import UserActionsMenu from './UserActionsMenu';
import { formatDate } from '../../utils/format';
import type { User } from '../../types/user';

interface UsersTableProps {
  users: User[];
  selectedUserId?: string | null;
  sort: string;
  onSort: (sort: string) => void;
  onRowClick: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

type SortDirection = 'ascending' | 'descending' | 'none';

interface SortHeaderProps {
  label: string;
  direction: SortDirection;
  onToggle: () => void;
}

function SortHeader({ label, direction, onToggle }: SortHeaderProps) {
  return (
    <button type="button" className="table__sort" onClick={onToggle}>
      <span>{label}</span>
      <Icon
        name={direction === 'none' ? 'sort' : direction === 'ascending' ? 'chevron-up' : 'chevron-down'}
        size={12}
        className={direction === 'none' ? 'table__sort-icon' : 'table__sort-icon table__sort-icon--active'}
      />
    </button>
  );
}

export default function UsersTable({
  users,
  selectedUserId,
  sort,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const nameDirection: SortDirection =
    sort === 'name' ? 'ascending' : sort === '-name' ? 'descending' : 'none';
  const joinedDirection: SortDirection =
    sort === 'createdAt' ? 'ascending' : sort === '-createdAt' || !sort ? 'descending' : 'none';

  function toggleName() {
    onSort(sort === 'name' ? '-name' : 'name');
  }

  function toggleJoined() {
    onSort(sort === '-createdAt' || !sort ? 'createdAt' : '-createdAt');
  }

  return (
    <div className="table-scroll">
      <table className="table table--users">
        <thead>
          <tr>
            <th scope="col" aria-sort={nameDirection}>
              <SortHeader label="User" direction={nameDirection} onToggle={toggleName} />
            </th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col" className="col-phone">
              Phone
            </th>
            <th scope="col" aria-sort={joinedDirection} className="col-joined">
              <SortHeader label="Joined" direction={joinedDirection} onToggle={toggleJoined} />
            </th>
            <th scope="col" className="table__actions-col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className={`table__row ${selectedUserId === user._id ? 'table__row--selected' : ''}`}
              tabIndex={0}
              aria-label={`View details for ${user.name}`}
              onClick={() => onRowClick(user)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRowClick(user);
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
              <td className="table__muted col-phone">{user.phone || '—'}</td>
              <td className="table__muted table__date col-joined">{formatDate(user.createdAt)}</td>
              <td className="table__actions">
                <UserActionsMenu
                  user={user}
                  onView={() => onRowClick(user)}
                  onEdit={() => onEdit(user)}
                  onDelete={() => onDelete(user)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
