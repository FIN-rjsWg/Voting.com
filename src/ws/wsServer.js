import { WebSocketServer } from 'ws';

import { verifyToken } from '../middleware/auth.js';
import { addMessage, getPollById } from '../db.js';

const pollRooms = new Map();

export function initWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const user = verifyToken(token);

    if (!user) {
      ws.close(4001, 'Unauthorized: invalid or missing token');
      return;
    }

    ws.user = user;
    ws.joinedPollId = null;
    ws.send(JSON.stringify({ type: 'connected', username: user.username }));

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'invalid JSON payload' }));
        return;
      }

      try {
        if (msg.type === 'join') {
          await handleJoin(ws, msg.pollId);
        } else if (msg.type === 'chat') {
          await handleChat(ws, msg.pollId, msg.message);
        } else {
          ws.send(JSON.stringify({ type: 'error', error: 'unsupported message type' }));
        }
      } catch (err) {
        console.error(err);
        ws.send(JSON.stringify({ type: 'error', error: 'server error' }));
      }
    });

    ws.on('close', () => {
      if (ws.joinedPollId) {
        pollRooms.get(ws.joinedPollId)?.delete(ws);
      }
    });
  });

  return wss;
}

async function handleJoin(ws, pollId) {
  if (!pollId || !(await getPollById(pollId))) {
    ws.send(JSON.stringify({ type: 'error', error: 'poll not found' }));
    return;
  }

  if (ws.joinedPollId) {
    pollRooms.get(ws.joinedPollId)?.delete(ws);
  }

  if (!pollRooms.has(pollId)) {
    pollRooms.set(pollId, new Set());
  }
  pollRooms.get(pollId).add(ws);
  ws.joinedPollId = pollId;

  ws.send(JSON.stringify({ type: 'joined', pollId }));
}

async function handleChat(ws, pollId, message) {
  if (!message || typeof message !== 'string' || !message.trim()) return;
  if (ws.joinedPollId !== pollId) {
    ws.send(JSON.stringify({ type: 'error', error: 'join the poll before chatting' }));
    return;
  }

  const entry = await addMessage({
    pollId,
    userId: ws.user.id,
    message: message.trim(),
  });

  broadcastToPoll(pollId, { type: 'chat', pollId, ...entry });
}

export function broadcastToPoll(pollId, payload) {
  const room = pollRooms.get(pollId);
  if (!room) return;

  const data = JSON.stringify(payload);
  for (const client of room) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}
