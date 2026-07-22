import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

import { PORT } from './src/config.js';
import authRoutes from './src/routes/auth.routes.js';
import pollRoutes from './src/routes/poll.routes.js';
import { initWebSocket } from './src/ws/wsServer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const server = createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Live Poll server running: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket endpoint:       ws://localhost:${PORT}/ws?token=<JWT>`);
});
