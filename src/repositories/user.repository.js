import prisma from '../config/database.js';

class UserRepository {
    async create(data) {
        // TODO: Implement prisma.user.create
    }

    async findById(id) {
        // TODO: Implement prisma.user.findUnique
    }

    async findByUsername(username) {
        // TODO: Implement prisma.user.findUnique by username
    }

    async update(id, data) {
        // TODO: Implement prisma.user.update
    }

    async saveRefreshToken(userId, token, expiresAt) {
        // TODO: Implement prisma.refreshToken.create
    }

    async findRefreshToken(token) {
        // TODO: Implement prisma.refreshToken.findUnique
    }
}

export default new UserRepository();
