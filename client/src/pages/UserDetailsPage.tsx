import { Navigate, useParams } from 'react-router-dom';

/**
 * Legacy deep link (`/users/:id`). The details view now opens as a drawer over
 * the directory so the list, filters and pagination stay in context.
 */
export default function UserDetailsPage() {
  const { id } = useParams();
  return <Navigate to={`/users?user=${encodeURIComponent(id ?? '')}`} replace />;
}
