import { WebSocketServer } from 'ws';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../db.js';

// pollId -> Set(ws)
const pollRooms = new Map();

let wss = null;

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

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

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return ws.send(JSON.stringify({ type: 'error', error: '잘못된 JSON 형식입니다' }));
      }

      if (msg.type === 'join') {
        handleJoin(ws, msg.pollId);
      } else if (msg.type === 'chat') {
        handleChat(ws, msg.pollId, msg.message);
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

function handleJoin(ws, pollId) {
  if (!db.polls.has(pollId)) {
    return ws.send(JSON.stringify({ type: 'error', error: '존재하지 않는 설문입니다' }));
  }

  // 기존 방에서 나가기
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

function handleChat(ws, pollId, message) {
  if (!message || typeof message !== 'string' || !message.trim()) return;
  if (ws.joinedPollId !== pollId) {
    return ws.send(JSON.stringify({ type: 'error', error: '먼저 join 해야 채팅할 수 있습니다' }));
  }

  const entry = {
    userId: ws.user.id,
    username: ws.user.username,
    message: message.trim(),
    timestamp: Date.now(),
  };

  const history = db.messages.get(pollId) || [];
  history.push(entry);
  db.messages.set(pollId, history);

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
