import prisma from '../config/database.js';

class ActivityRepository {
    async log(data) {
        // TODO: Implement prisma.activityLog.create
    }

    async findByEntity(entityType, entityId) {
        // TODO: Implement prisma.activityLog.findMany
    }
}

export default new ActivityRepository();
