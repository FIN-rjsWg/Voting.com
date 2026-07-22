import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET, ACCESS_TOKEN_EXPIRE, REFRESH_TOKEN_EXPIRE } from '../config/env.js';

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};
