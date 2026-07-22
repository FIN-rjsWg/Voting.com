import { WEBSOCKET_CONFIG } from '../config/websocket.js';

class RoomManager {
    constructor() {
        this.rooms = new Map(); // pollId -> Set(ws)
    }

    joinRoom(pollId, ws) {
        if (!this.rooms.has(pollId)) {
            this.rooms.set(pollId, new Set());
        }
        
        const room = this.rooms.get(pollId);
        if (room.size >= WEBSOCKET_CONFIG.MAX_CLIENTS_PER_POLL) {
            throw new Error('Room is full');
        }
        
        room.add(ws);
        ws.currentRoom = pollId;
    }

    leaveRoom(pollId, ws) {
        if (this.rooms.has(pollId)) {
            this.rooms.get(pollId).delete(ws);
            if (this.rooms.get(pollId).size === 0) {
                this.rooms.delete(pollId);
            }
        }
        ws.currentRoom = null;
    }

    getRoomClients(pollId) {
        return this.rooms.get(pollId) || new Set();
    }
}

export default new RoomManager();
