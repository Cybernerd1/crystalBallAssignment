import Avatar from '../ui/Avatar';
import Icon from '../ui/Icon';
import { formatDate } from '../../utils/format';
import type { User } from '../../types/user';

interface UsersTableProps {
  users: User[];
  onRowClick: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({ users, onRowClick, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">User</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Phone</th>
            <th scope="col">Joined</th>
            <th scope="col" className="table__actions-col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user._id}
              className="table__row"
              tabIndex={0}
              onClick={() => onRowClick(user)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onRowClick(user);
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
              <td className="table__muted">{user.phone || '—'}</td>
              <td className="table__muted">{formatDate(user.createdAt)}</td>
              <td className="table__actions">
                <button
                  type="button"
                  className="btn btn--icon btn--ghost"
                  aria-label={`Edit ${user.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(user);
                  }}
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn--icon btn--ghost table__delete"
                  aria-label={`Delete ${user.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(user);
                  }}
                >
                  <Icon name="trash" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
