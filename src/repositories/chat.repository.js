import prisma from '../config/database.js';

class ChatRepository {
    async create(messageData) {
        return prisma.message.create({ data: messageData });
    }

    async findByPollId(pollId) {
        return prisma.message.findMany({
            where: { pollId },
            include: { user: { select: { username: true } } },
            orderBy: { timestamp: 'asc' }
        });
    }
}

export default new ChatRepository();
