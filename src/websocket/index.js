import { WebSocketServer } from 'ws';
import connectionManager from './connectionManager.js';
import roomManager from './roomManager.js';
import { dispatchSocketEvent } from './handlers/index.js';
import { verifyAccessToken } from '../utils/jwt.js';

export function initWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const token = url.searchParams.get('token');
        const user = verifyAccessToken(token);

        if (!user) {
            ws.close(4001, 'Unauthorized');
            return;
        }

        ws.user = user;
        connectionManager.addConnection(user.id, ws);

        ws.on('message', async (message) => {
            try {
                await dispatchSocketEvent(ws, message);
            } catch (error) {
                ws.send(JSON.stringify({ type: 'error', message: error.message }));
            }
        });

        ws.on('close', () => {
            if (ws.currentRoom) {
                roomManager.leaveRoom(ws.currentRoom, ws);
            }
            connectionManager.removeConnection(ws.user.id);
        });

        // Send initial connection success pulse
        ws.send(JSON.stringify({ type: 'connected', isPulse: true }));
    });

    return wss;
}
