// src/websocket/handler.js
import { EVENTS } from '../constants/events.js';
import roomManager from './roomManager.js';
import pulseService from '../services/pulse.service.js';

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

    // 펄스 하트비트 처리
    socket.on(EVENTS.HEARTBEAT, async (data) => {
        try {
            // data: { pollId, userId, bpm }
            if (data && data.pollId && data.bpm) {
                const poll = await pulseService.recordPulse(data.pollId, data.userId, data.bpm);
                if (poll) {
                    // 같은 방(투표)에 있는 모든 클라이언트에게 평균 BPM 브로드캐스트
                    io.to(data.pollId).emit(EVENTS.VOTE_CAST, {
                        pollId: poll.id,
                        total: poll.totalVotes,
                        bpm: poll.averageBpm,
                        options: poll.options
                    });
                }
            }
        } catch (err) {
            console.error('[WS] Heartbeat error:', err.message);
        }
    });

    socket.on('disconnect', () => {
        roomManager.handleDisconnect(socket);
        console.log(`[WS] Client disconnected: ${socket.id}`);
    });
}
