import authService from '../services/auth.service.js';
import { success, fail } from '../utils/response.js';

class AuthController {
    async register(req, res) {
        try {
            const { username, password } = req.body;
            const result = await authService.register(username, password);
            res.status(201).json(success(result));
        } catch (err) {
            res.status(400).json(fail(err.message));
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await authService.login(username, password);
            res.json(success(result));
        } catch (err) {
            res.status(401).json(fail(err.message));
        }
    }
}

export default new AuthController();
