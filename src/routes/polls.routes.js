// src/routes/polls.routes.js
import { Router } from 'express';
import { EVENTS } from '../constants/events.js';
import pollService from '../services/poll.service.js';

const ERROR_MESSAGES = {
    not_found: '존재하지 않는 투표입니다.',
    closed: '마감된 투표입니다.',
    no_user: '로그인이 필요합니다.',
    already_voted: '이미 투표에 참여하셨습니다.',
    invalid_option: '유효하지 않은 선택지입니다.'
};

export default function pollsRouter(io) {
    const router = Router();

    // 전체 투표 목록
    router.get('/', (req, res) => {
        res.json(pollService.getAll());
    });

    // 단일 투표 조회 (?userId= 로 내가 이미 투표했는지 여부 포함)
    router.get('/:id', (req, res) => {
        const poll = pollService.getById(req.params.id, req.query.userId);
        if (!poll) return res.status(404).json({ error: ERROR_MESSAGES.not_found });
        res.json(poll);
    });

    // 새 투표 생성
    router.post('/', (req, res) => {
        const { title, options } = req.body;
        if (!title || !Array.isArray(options) || options.filter(o => o.trim()).length < 2) {
            return res.status(400).json({ error: '제목과 2개 이상의 선택지가 필요합니다.' });
        }
        const poll = pollService.create(title.trim(), options.map(o => o.trim()).filter(Boolean));
        io.emit(EVENTS.POLL_CREATED, poll);
        res.status(201).json(poll);
    });

    // 투표 참여(선택지에 투표) - 1인 1표
    router.post('/:id/vote', (req, res) => {
        const { optionId, userId } = req.body;
        const result = pollService.vote(req.params.id, optionId, userId);

        if (result.error) {
            const status = result.error === 'not_found' ? 404
                : result.error === 'already_voted' ? 409
                : 400;
            return res.status(status).json({ error: ERROR_MESSAGES[result.error] || '투표에 실패했습니다.' });
        }

        const poll = result.poll;
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
        if (!poll) return res.status(404).json({ error: ERROR_MESSAGES.not_found });
        io.to(poll.id).emit(EVENTS.POLL_CLOSED);
        res.json(poll);
    });

    return router;
}
