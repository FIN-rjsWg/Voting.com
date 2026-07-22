// src/services/poll.service.js
// 인메모리 투표 저장소 (재시작 시 초기화됨)

let seq = 1;
const polls = new Map();

function seed() {
    create('이번 주말 회식 메뉴는?', ['치킨', '피자', '삼겹살']);
    create('다음 프로젝트 워크샵 장소', ['강릉', '제주', '가평']);
}

function nextId() {
    return String(seq++);
}

function toClient(poll) {
    return {
        id: poll.id,
        title: poll.title,
        isOpen: poll.isOpen,
        totalVotes: poll.totalVotes,
        averageBpm: poll.pulseCount ? Math.round(poll.pulseSum / poll.pulseCount) : null,
        options: poll.options.map(o => ({ id: o.id, label: o.label, votes: o.votes }))
    };
}

function getAll() {
    return [...polls.values()].map(toClient);
}

function getById(id) {
    const poll = polls.get(id);
    return poll ? toClient(poll) : null;
}

function create(title, optionLabels) {
    const id = nextId();
    const poll = {
        id,
        title,
        isOpen: true,
        totalVotes: 0,
        pulseSum: 0,
        pulseCount: 0,
        userPulse: new Map(), // userId -> last bpm (평균 계산용)
        options: optionLabels.map((label, i) => ({ id: String(i + 1), label, votes: 0 }))
    };
    polls.set(id, poll);
    return toClient(poll);
}

function vote(pollId, optionId, userId) {
    const poll = polls.get(pollId);
    if (!poll || !poll.isOpen) return null;
    const option = poll.options.find(o => o.id === optionId);
    if (!option) return null;
    option.votes += 1;
    poll.totalVotes += 1;
    return toClient(poll);
}

function recordPulse(pollId, userId, bpm) {
    const poll = polls.get(pollId);
    if (!poll) return null;
    const prev = poll.userPulse.get(userId);
    if (prev === undefined) {
        poll.pulseCount += 1;
    } else {
        poll.pulseSum -= prev;
    }
    poll.pulseSum += bpm;
    poll.userPulse.set(userId, bpm);
    return toClient(poll);
}

function close(pollId) {
    const poll = polls.get(pollId);
    if (!poll) return null;
    poll.isOpen = false;
    return toClient(poll);
}

seed();

export default { getAll, getById, create, vote, recordPulse, close };
