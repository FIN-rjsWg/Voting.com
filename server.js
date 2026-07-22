// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import setupWebSocketHandlers from './src/websocket/handler.js';
import pollsRouter from './src/routes/polls.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/polls', pollsRouter(io));

io.on('connection', (socket) => setupWebSocketHandlers(io, socket));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`[PulseVote] Server running on http://localhost:${PORT}`);
});
