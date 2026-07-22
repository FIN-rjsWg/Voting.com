// 프로토타입용 인메모리 저장소.
// 실서비스 전환 시 SQLite/Postgres 등으로 교체 예정.

export const db = {
  users: new Map(),        // id -> { id, username, passwordHash }
  usersByName: new Map(),  // username -> id
  polls: new Map(),        // id -> { id, question, options, creatorId, isOpen, createdAt }
  votes: new Map(),        // pollId -> Map(userId -> optionIndex)
  messages: new Map(),     // pollId -> [{ userId, username, message, timestamp }]
};

export function getPollResults(pollId) {
  const poll = db.polls.get(pollId);
  if (!poll) return null;

  const voteMap = db.votes.get(pollId) || new Map();
  const results = new Array(poll.options.length).fill(0);
  for (const optionIndex of voteMap.values()) {
    results[optionIndex] += 1;
  }
  const total = [...voteMap.values()].length;
  return { results, total };
}
