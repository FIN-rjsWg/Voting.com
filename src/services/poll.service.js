// src/services/poll.service.js
// 인메모리 투표 저장소 (재시작 시 초기화됨)
// BPM은 "투표 열기"의 실시간 열기 정도 = 총 투표수를 그대로 반영한다.

let seq = 1;
const polls = new Map();

function seed() {
    create('이번 주말 회식 메뉴는?', ['치킨', '피자', '삼겹살']);
    create('다음 프로젝트 워크샵 장소', ['강릉', '제주', '가평']);
}

function nextId() {
    return String(seq++);
}

function toClient(poll, userId) {
    return {
        id: poll.id,
        title: poll.title,
        isOpen: poll.isOpen,
        totalVotes: poll.totalVotes,
        averageBpm: poll.totalVotes, // BPM = 총 투표수 반영
        hasVoted: !!userId && poll.voters.has(userId),
        options: poll.options.map(o => ({ id: o.id, label: o.label, votes: o.votes }))
    };
}

function getAll() {
    return [...polls.values()].map(p => toClient(p));
}

function getById(id, userId) {
    const poll = polls.get(id);
    return poll ? toClient(poll, userId) : null;
}

function create(title, optionLabels) {
    const id = nextId();
    const poll = {
        id,
        title,
        isOpen: true,
        totalVotes: 0,
        voters: new Set(), // 이미 투표한 userId (중복 투표 방지)
        options: optionLabels.map((label, i) => ({ id: String(i + 1), label, votes: 0 }))
    };
    polls.set(id, poll);
    return toClient(poll);
}

// 반환값: { poll } 성공 / { error } 실패
// error: 'not_found' | 'closed' | 'no_user' | 'already_voted' | 'invalid_option'
function vote(pollId, optionId, userId) {
    const poll = polls.get(pollId);
    if (!poll) return { error: 'not_found' };
    if (!poll.isOpen) return { error: 'closed' };
    if (!userId) return { error: 'no_user' };
    if (poll.voters.has(userId)) return { error: 'already_voted' };

    const option = poll.options.find(o => o.id === optionId);
    if (!option) return { error: 'invalid_option' };

    option.votes += 1;
    poll.totalVotes += 1;
    poll.voters.add(userId);

    return { poll: toClient(poll, userId) };
}

function close(pollId) {
    const poll = polls.get(pollId);
    if (!poll) return null;
    poll.isOpen = false;
    return toClient(poll);
}

seed();

export default { getAll, getById, create, vote, close };
