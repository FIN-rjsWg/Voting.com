import { handleVote } from './vote.handler.js';
import { handleChat } from './chat.handler.js';
import { handlePoll } from './poll.handler.js';

export const socketHandlers = {
    'vote:cast': handleVote,
    'chat:message': handleChat,
    'poll:action': handlePoll,
    // Add more handlers as needed
};

export const dispatchSocketEvent = async (ws, message) => {
    const { type, payload } = JSON.parse(message);
    const handler = socketHandlers[type];
    
    if (handler) {
        await handler(ws, payload);
    } else {
        ws.send(JSON.stringify({ type: 'error', message: `Unknown event type: ${type}` }));
    }
};
