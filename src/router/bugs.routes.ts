// src/routes/bugs.routes.ts
import { Router } from 'express';
import { BugsController } from '../controllers/bugs.controller';

const router = Router();

// POST /api/bugs
router.post('/', BugsController.create);

// GET /api/bugs/:bugid
router.get('/:bugid', BugsController.get);

// GET /api/projects/:projectid/bugs
router.get('/project/:projectid', BugsController.listByProject);

// PATCH /api/bugs/:bugid
router.patch('/:bugid', BugsController.update);

// DELETE /api/bugs/:bugid
router.delete('/:bugid', BugsController.remove);

export default router;
