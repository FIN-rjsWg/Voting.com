import prisma from '../config/database.js';

class VoteRepository {
    async create(data) {
        // TODO: Implement prisma.vote.create
    }

    async findByUserAndPoll(userId, pollId) {
        // TODO: Implement prisma.vote.findUnique for composite key
    }

    async countByOption(pollId) {
        // TODO: Implement prisma.vote.groupBy optionId
    }
}

export default new VoteRepository();
