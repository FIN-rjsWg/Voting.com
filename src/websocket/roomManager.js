// src/websocket/roomManager.js
// 소켓 <-> 투표방(room) 매핑을 관리한다.

const socketRooms = new Map(); // socketId -> Set(roomId)

function joinRoom(socket, roomId) {
    if (!roomId) return;
    socket.join(roomId);
    if (!socketRooms.has(socket.id)) socketRooms.set(socket.id, new Set());
    socketRooms.get(socket.id).add(roomId);
}

function leaveRoom(socket, roomId) {
    if (!roomId) return;
    socket.leave(roomId);
    socketRooms.get(socket.id)?.delete(roomId);
}

function handleDisconnect(socket) {
    socketRooms.delete(socket.id);
}

export default { joinRoom, leaveRoom, handleDisconnect };
