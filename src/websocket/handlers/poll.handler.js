import eventDispatcher from '../eventDispatcher.js';
import { EVENTS } from '../../constants/events.js';

export const handlePollClosed = (pollId) => {
    eventDispatcher.dispatch(pollId, {
        type: EVENTS.POLL_CLOSED,
        pollId
    });
};
