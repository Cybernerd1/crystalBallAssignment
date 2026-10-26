import { Router } from 'express';

import {
  createUser,
  deleteUser,
  getUser,
  getUserStats,
  listUsers,
  updateUser,
} from '../controllers/user.controller.js';

const router = Router();

// Static routes first so "/stats" is never swallowed by "/:id"
router.get('/stats', getUserStats);

router.route('/').get(listUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;
