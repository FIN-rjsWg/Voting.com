import pollService from '../services/poll.service.js';
import pollValidator from '../validators/poll.validator.js';
import { success, fail } from '../utils/response.js';

class PollController {
    async create(req, res) {
        // TODO: Validate, call service, return response
    }

    async getOne(req, res) {
        // TODO: Call service, return response
    }

    async getAll(req, res) {
        // TODO: Call service with query params, return response
    }

    async close(req, res) {
        // TODO: Call service, return response
    }
}

export default new PollController();
