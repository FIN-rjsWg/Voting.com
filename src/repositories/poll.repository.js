import prisma from '../config/database.js';

class PollRepository {
    async create(data) {
        // TODO: Implement prisma.poll.create with nested options
    }

    async findById(id) {
        // TODO: Implement prisma.poll.findUnique with includes
    }

    async findAll() {
        // TODO: Implement prisma.poll.findMany with pagination
    }

    async update(id, data) {
        // TODO: Implement prisma.poll.update
    }

    async delete(id) {
        // TODO: Implement prisma.poll.delete
    }

    async findOptionsByPollId(pollId) {
        // TODO: Implement prisma.pollOption.findMany
    }
}

export default new PollRepository();
