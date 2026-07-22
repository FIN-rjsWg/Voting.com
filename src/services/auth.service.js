import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository.js';
import { JWT_SECRET, ACCESS_TOKEN_EXPIRE } from '../config/env.js';

class AuthService {
    async register(username, password) {
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) throw new Error('이미 존재하는 사용자 이름입니다');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userRepository.create({
            username,
            password: hashedPassword
        });

        return this.generateToken(user);
    }

    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        if (!user) throw new Error('사용자를 찾을 수 없습니다');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('비밀번호가 일치하지 않습니다');

        return this.generateToken(user);
    }

    generateToken(user) {
        const payload = { id: user.id, username: user.username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
        return { token, user: { id: user.id, username: user.username } };
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return null;
        }
    }
}

export default new AuthService();
