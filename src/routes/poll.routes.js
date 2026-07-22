import { randomUUID } from 'crypto';
import { Router } from 'express';

import {
  closePoll,
  createPoll,
  createVote,
  getPollById,
  getPollResults,
  listMessages,
  listPolls,
} from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { broadcastToPoll } from '../ws/wsServer.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const polls = await Promise.all(
      (await listPolls()).map(async (poll) => ({
        ...poll,
        ...(await getPollResults(poll.id)),
      })),
    );
    return res.json(polls);
  } catch (err) {
    return next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { question, options } = req.body || {};
    const normalizedQuestion = typeof question === 'string' ? question.trim() : '';
    const normalizedOptions = Array.isArray(options)
      ? options.map((option) => (typeof option === 'string' ? option.trim() : ''))
      : [];

    if (!normalizedQuestion) {
      return res.status(400).json({ error: 'question must be a non-empty string' });
    }
    if (normalizedOptions.length < 2 || normalizedOptions.some((option) => !option)) {
      return res.status(400).json({
        error: 'options must contain at least 2 non-empty strings',
      });
    }

    const poll = await createPoll({
      id: randomUUID(),
      question: normalizedQuestion,
      options: normalizedOptions,
      creatorId: req.user.id,
    });

    return res.status(201).json({
      ...poll,
      results: new Array(normalizedOptions.length).fill(0),
      total: 0,
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const poll = await getPollById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'poll not found' });

    return res.json({ ...poll, ...(await getPollResults(poll.id)) });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/vote', requireAuth, async (req, res, next) => {
  try {
    const poll = await getPollById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'poll not found' });
    if (!poll.isOpen) return res.status(409).json({ error: 'poll is already closed' });

    const { optionIndex } = req.body || {};
    if (
      typeof optionIndex !== 'number' ||
      !Number.isInteger(optionIndex) ||
      optionIndex < 0 ||
      optionIndex >= poll.options.length
    ) {
      return res.status(400).json({ error: 'invalid optionIndex' });
    }

    try {
      await createVote({ pollId: poll.id, userId: req.user.id, optionIndex });
    } catch (err) {
      if (err.code === 'DUPLICATE_VOTE') {
        return res.status(409).json({ error: 'user already voted in this poll' });
      }
      throw err;
    }

    const summary = await getPollResults(poll.id);
    broadcastToPoll(poll.id, {
      type: 'vote_update',
      pollId: poll.id,
      ...summary,
    });

    return res.json(summary);
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/close', requireAuth, async (req, res, next) => {
  try {
    const poll = await getPollById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'poll not found' });
    if (poll.creatorId !== req.user.id) {
      return res.status(403).json({ error: 'only the poll creator can close this poll' });
    }

    await closePoll({ pollId: poll.id, userId: req.user.id });
    const closedPoll = await getPollById(poll.id);

    broadcastToPoll(poll.id, { type: 'poll_closed', pollId: poll.id });

    return res.json({ ...closedPoll, ...(await getPollResults(poll.id)) });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id/messages', async (req, res, next) => {
  try {
    const poll = await getPollById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'poll not found' });

    return res.json(await listMessages(poll.id));
  } catch (err) {
    return next(err);
  }
});

export default router;
