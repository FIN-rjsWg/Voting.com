import eventDispatcher from '../eventDispatcher.js';
import { EVENTS } from '../../constants/events.js';

export const handleVoteUpdate = (pollId, results) => {
    eventDispatcher.dispatch(pollId, {
        type: EVENTS.VOTE_CAST,
        pollId,
        ...results
    });
};
