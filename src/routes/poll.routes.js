import express from 'express';
import pollController from '../controllers/poll.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Poll Management
router.get('/', pollController.getAll);
router.post('/', requireAuth, pollController.create);
router.get('/:id', pollController.getOne);
router.patch('/:id', requireAuth, pollController.close); // Partial update for closing

// Nested Resources (Votes & Messages)
router.post('/:id/votes', requireAuth, pollController.vote);
router.get('/:id/messages', pollController.getMessages);

export default router;
