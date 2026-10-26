import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  createUser as createUserService,
  deleteUser as deleteUserService,
  getUserById,
  getUserStats as fetchUserStats,
  listUsers as listUsersService,
  updateUser as updateUserService,
} from '../services/user.service.js';
import { validateCreateUser, validateUpdateUser } from '../validators/user.validator.js';

/** GET /api/users */
export const listUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await listUsersService(req.query);
  res.status(200).json({ data: users, pagination });
});

/** GET /api/users/stats (registered before /:id so matching is unambiguous) */
export const getUserStats = asyncHandler(async (_req, res) => {
  const stats = await fetchUserStats();
  res.status(200).json({ data: stats });
});

/** GET /api/users/:id */
export const getUser = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  res.status(200).json({ data: user });
});

/** POST /api/users */
export const createUser = asyncHandler(async (req, res) => {
  const { value, errors } = validateCreateUser(req.body);

  if (Object.keys(errors).length > 0) {
    throw ApiError.validation('Validation failed', errors);
  }

  const user = await createUserService(value);
  res.status(201).json({ data: user });
});

/** PUT /api/users/:id */
export const updateUser = asyncHandler(async (req, res) => {
  const { value, errors } = validateUpdateUser(req.body);

  const hasPayload = Object.keys(value).length > 0;
  const hasErrors = Object.keys(errors).length > 0;

  if (hasErrors) {
    throw ApiError.validation('Validation failed', errors);
  }
  if (!hasPayload) {
    throw ApiError.validation('Provide at least one field to update');
  }

  const user = await updateUserService(req.params.id, value);
  res.status(200).json({ data: user });
});

/** DELETE /api/users/:id — PRD contract: `{ data: { id } }` */
export const deleteUser = asyncHandler(async (req, res) => {
  await deleteUserService(req.params.id);
  res.status(200).json({ data: { id: req.params.id } });
});
