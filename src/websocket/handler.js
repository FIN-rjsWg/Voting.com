// src/websocket/handler.js
// 방(투표) 입장/퇴장만 담당한다. 투표 브로드캐스트는 REST 라우트에서 처리한다.
import { EVENTS } from '../constants/events.js';
import roomManager from './roomManager.js';

export default function setupWebSocketHandlers(io, socket) {
    console.log(`[WS] Client connected: ${socket.id}`);

    // 특정 투표(방) 참여
    socket.on(EVENTS.JOIN_ROOM, (roomId) => {
        roomManager.joinRoom(socket, roomId);
        console.log(`[WS] Socket ${socket.id} joined room ${roomId}`);
    });

    // 특정 투표(방) 퇴장
    socket.on(EVENTS.LEAVE_ROOM, (roomId) => {
        roomManager.leaveRoom(socket, roomId);
    });

    socket.on('disconnect', () => {
        roomManager.handleDisconnect(socket);
        console.log(`[WS] Client disconnected: ${socket.id}`);
    });
}
