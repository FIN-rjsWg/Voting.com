import chatRepository from '../repositories/chat.repository.js';

class ChatService {
    async saveMessage(pollId, userId, content) {
        if (!content || !content.trim()) throw new Error('메시지 내용이 없습니다');
        
        return chatRepository.create({
            pollId,
            userId,
            content: content.trim()
        });
    }

    async getMessages(pollId) {
        return chatRepository.findByPollId(pollId);
    }
}

export default new ChatService();
