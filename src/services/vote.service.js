import voteRepository from '../repositories/vote.repository.js';
import pollRepository from '../repositories/poll.repository.js';

class VoteService {
    async castVote(pollId, userId, optionIndex) {
        const poll = await pollRepository.findById(pollId);
        if (!poll) throw new Error('설문을 찾을 수 없습니다');
        if (!poll.isOpen) throw new Error('이미 마감된 설문입니다');

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            throw new Error('유효하지 않은 선택지입니다');
        }

        const existingVote = await voteRepository.findByUserAndPoll(userId, pollId);
        if (existingVote) throw new Error('이미 투표하셨습니다');

        return voteRepository.create({
            pollId,
            userId,
            optionIndex
        });
    }
}

export default new VoteService();
