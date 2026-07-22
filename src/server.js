import http from 'http';
import app from './app.js';
import { PORT } from './config/env.js';
import { initWebSocket } from './websocket/index.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
