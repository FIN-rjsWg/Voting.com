// src/services/pulse.service.js
import pollService from './poll.service.js';

async function recordPulse(pollId, userId, bpm) {
    return pollService.recordPulse(pollId, userId, bpm);
}

export default { recordPulse };
