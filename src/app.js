import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import pollRoutes from './routes/poll.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security & Logging Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/polls', pollRoutes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'UP', timestamp: new Date() }));

// 404 Handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Not Found' }));

// Global Error Handler
app.use(errorHandler);

export default app;
