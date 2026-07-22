import authService from '../services/auth.service.js';
import { fail } from '../utils/response.js';

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(fail('인증이 필요합니다'));
    }

    const token = authHeader.split(' ')[1];
    const user = authService.verifyToken(token);

    if (!user) {
        return res.status(401).json(fail('유효하지 않은 토큰입니다'));
    }

    req.user = user;
    next();
};

export const verifyToken = (token) => {
    return authService.verifyToken(token);
};
