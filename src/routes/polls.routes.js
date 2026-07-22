// src/routes/polls.routes.js
import { Router } from 'express';
import { EVENTS } from '../constants/events.js';
import pollService from '../services/poll.service.js';

export default function pollsRouter(io) {
    const router = Router();

    // 전체 투표 목록
    router.get('/', (req, res) => {
        res.json(pollService.getAll());
    });

    // 단일 투표 조회
    router.get('/:id', (req, res) => {
        const poll = pollService.getById(req.params.id);
        if (!poll) return res.status(404).json({ error: 'Poll not found' });
        res.json(poll);
    });

    // 새 투표 생성
    router.post('/', (req, res) => {
        const { title, options } = req.body;
        if (!title || !Array.isArray(options) || options.filter(o => o.trim()).length < 2) {
            return res.status(400).json({ error: '제목과 2개 이상의 선택지가 필요합니다.' });
        }
        const poll = pollService.create(title.trim(), options.map(o => o.trim()).filter(Boolean));
        io.emit('poll:created', poll);
        res.status(201).json(poll);
    });

    // 투표 참여(선택지에 투표)
    router.post('/:id/vote', (req, res) => {
        const { optionId, userId } = req.body;
        const poll = pollService.vote(req.params.id, optionId, userId);
        if (!poll) return res.status(400).json({ error: '투표할 수 없습니다.' });

        io.to(poll.id).emit(EVENTS.VOTE_CAST, {
            pollId: poll.id,
            total: poll.totalVotes,
            bpm: poll.averageBpm,
            options: poll.options
        });
        res.json(poll);
    });

    // 투표 마감
    router.post('/:id/close', (req, res) => {
        const poll = pollService.close(req.params.id);
        if (!poll) return res.status(404).json({ error: 'Poll not found' });
        io.to(poll.id).emit(EVENTS.POLL_CLOSED);
        res.json(poll);
    });

    return router;
}
