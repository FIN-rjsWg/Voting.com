import chatService from '../../services/chat.service.js';
import eventDispatcher from '../eventDispatcher.js';
import { EVENTS } from '../../constants/events.js';

export const handleChat = async (ws, pollId, message) => {
    try {
        const entry = await chatService.saveMessage(pollId, ws.user.id, message);
        eventDispatcher.dispatch(pollId, {
            type: EVENTS.CHAT_MESSAGE,
            pollId,
            userId: ws.user.id,
            username: ws.user.username,
            message: entry.content,
            timestamp: entry.timestamp
        });
    } catch (err) {
        ws.send(JSON.stringify({ type: 'error', error: err.message }));
    }
};
