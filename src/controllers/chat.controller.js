import chatService from '../services/chat.service.js';
import { success, fail } from '../utils/response.js';

class ChatController {
    async getMessages(req, res) {
        try {
            const messages = await chatService.getMessages(req.params.id);
            res.json(success(messages));
        } catch (err) {
            res.status(404).json(fail(err.message));
        }
    }
}

export default new ChatController();
