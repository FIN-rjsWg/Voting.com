import { WEBSOCKET_CONFIG } from '../config/websocket.js';

class ConnectionManager {
    constructor() {
        this.connections = new Map(); // userId -> ws
    }

    addConnection(userId, ws) {
        if (this.connections.size >= WEBSOCKET_CONFIG.MAX_TOTAL_CLIENTS) {
            throw new Error('Server reached max connections');
        }
        this.connections.set(userId, ws);
    }

    removeConnection(userId) {
        this.connections.delete(userId);
    }

    isUserConnected(userId) {
        return this.connections.has(userId);
    }

    getUserSocket(userId) {
        return this.connections.get(userId);
    }
}

export default new ConnectionManager();
