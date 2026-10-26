import { useCallback, useEffect, useState } from 'react';

import { usersApi, type ListUsersParams, type UsersListResponse } from '../services/usersApi';
import type { UserStats } from '../types/user';

/**
 * Fetches a page of users from the API. Re-runs automatically whenever any
 * query parameter changes; `refetch` forces a reload after mutations.
 */
export function useUsers(params: ListUsersParams) {
  const [data, setData] = useState<UsersListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const { page, limit, search, role, status, sort } = params;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    usersApi
      .list({ page, limit, search, role, status, sort })
      .then((response) => {
        if (!cancelled) {
          setData(response);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load users');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, search, role, status, sort, reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, loading, error, refetch };
}

/** Dashboard counters (total / active / new this week). */
export function useUserStats() {
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    usersApi
      .stats()
      .then((stats) => {
        if (!cancelled) {
          setData(stats);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);
  return { data, loading, error, refetch };
}
