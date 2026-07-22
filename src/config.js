import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';
export const JWT_EXPIRES_IN = '2h';
export const DB_FILE = process.env.DB_FILE || 'data/live-poll.sqlite';
