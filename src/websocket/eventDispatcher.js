import roomManager from './roomManager.js';
import { EVENTS } from '../constants/events.js';

class EventDispatcher {
    // 특정 방(Poll)의 모든 클라이언트에게 이벤트 전송
    broadcastToRoom(pollId, eventType, payload) {
        const clients = roomManager.getRoomClients(pollId);
        const message = JSON.stringify({
            type: eventType,
            pollId,
            payload,
            timestamp: Date.now(),
            isPulse: true // 시각적 '박동' 효과 트리거용 플래그
        });

        clients.forEach(client => {
            if (client.readyState === 1) { // OPEN
                client.send(message);
            }
        });
    }

    // 시스템 전체 브로드캐스트
    broadcastGlobal(eventType, payload) {
        // TODO: Implement global broadcast logic via ConnectionManager
    }

    // 특정 유저에게 개별 메시지 전송
    sendToUser(userId, eventType, payload) {
        // TODO: Implement direct messaging via ConnectionManager
    }
}

export default new EventDispatcher();
