import User, { ROLES, STATUSES } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const DEFAULT_LIMIT = 8;
export const MAX_LIMIT = 100;
export const SORTABLE_FIELDS = new Set(['name', 'email', 'role', 'status', 'createdAt', 'updatedAt']);
const DEFAULT_SORT = '-createdAt';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Start of the current date minus 7 days (rolling week), used for the
 * "new users this week" dashboard stat.
 */
function sevenDaysAgo(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

/** GET /api/users — server-side search, filtering, sorting and pagination. */
export async function listUsers(query = {}) {
  const page = Math.max(1, toPositiveInt(query.page, 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, toPositiveInt(query.limit, DEFAULT_LIMIT)));

  const filter = {};

  if (query.role) {
    if (!ROLES.includes(query.role)) {
      throw ApiError.validation('Invalid role filter');
    }
    filter.role = query.role;
  }

  if (query.status) {
    if (!STATUSES.includes(query.status)) {
      throw ApiError.validation('Invalid status filter');
    }
    filter.status = query.status;
  }

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    const pattern = new RegExp(escapeRegex(search.slice(0, 100)), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const sortInput = typeof query.sort === 'string' ? query.sort : '';
  const desc = sortInput.startsWith('-');
  const sortField = sortInput.replace(/^-/, '');
  let sort = DEFAULT_SORT;
  if (sortField && SORTABLE_FIELDS.has(sortField)) {
    sort = `${desc ? '-' : ''}${sortField}`;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/** GET /api/users/stats — dashboard counters computed in one Mongo aggregate. */
export async function getUserStats() {
  const cutoff = sevenDaysAgo();
  const [row] = await User.aggregate([
    { $group: {
      _id: null,
      total: { $sum: 1 },
      active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
      inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
      last7Days: { $sum: { $cond: [{ $gte: ['$createdAt', cutoff] }, 1, 0] } },
    } },
  ]);

  return row
    ? { total: row.total, active: row.active, inactive: row.inactive, last7Days: row.last7Days }
    : { total: 0, active: 0, inactive: 0, last7Days: 0 };
}

/** GET /api/users/:id */
export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

/** POST /api/users */
export async function createUser(data) {
  try {
    return await User.create(data);
  } catch (err) {
    // Duplicate email slipping past the fast-path check
    if (err?.code === 11000) {
      throw ApiError.duplicateEmail();
    }
    throw err;
  }
}

/** PUT /api/users/:id */
export async function updateUser(id, data) {
  if (data.email) {
    const clash = await User.findOne({ email: data.email, _id: { $ne: id } });
    if (clash) {
      throw ApiError.duplicateEmail();
    }
  }

  const updated = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    context: 'query',
  });

  if (!updated) {
    throw ApiError.notFound('User not found');
  }
  return updated;
}

/** DELETE /api/users/:id */
export async function deleteUser(id) {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    throw ApiError.notFound('User not found');
  }
  return deleted;
}
