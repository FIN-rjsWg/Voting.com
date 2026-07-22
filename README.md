# Live Poll — 실시간 설문/투표 서비스

미니 해커톤 프로토타입. Node.js의 비동기 이벤트 기반 처리(논블로킹 I/O)가 다수 사용자의
동시 투표 · 실시간 채팅을 자연스럽게 처리하는 모습을 보여주는 서비스입니다.

## 제약 조건 충족

- ✅ Node.js 20.x 이상 (`"engines": { "node": ">=20.0.0" }`)
- ✅ REST API 포함 (`/api/auth/*`, `/api/polls/*`)
- ✅ WebSocket 사용 (`/ws` — 실시간 투표 결과, 채팅)
- ✅ 회원가입 / 로그인 (JWT 기반)
- ✅ 택1 → **실시간 채팅** (설문방 안에서 참가자끼리 의견 교환)

## 기술 스택

- Express 4 (REST API)
- `ws` (순수 WebSocket 서버)
- `jsonwebtoken` + `bcryptjs` (인증)
- 인메모리 저장소 (프로토타입 — 실서비스 전환 시 DB로 교체)

## 실행 방법

```bash
npm install
cp .env.example .env
npm start
# http://localhost:3000 접속 (public/index.html 데모 UI 포함)
```

## 도메인 모델

| 엔티티 | 필드 |
|---|---|
| User | id, username, passwordHash |
| Poll | id, question, options[], creatorId, isOpen, createdAt |
| Vote | pollId → userId → optionIndex (1인 1표) |
| ChatMessage | pollId, userId, username, message, timestamp |

## REST API

### 인증

```
POST /api/auth/signup   { username, password } → 201 { id, username }
POST /api/auth/login    { username, password } → 200 { token, user }
```

### 설문

```
GET  /api/polls                     설문 목록 + 실시간 집계
POST /api/polls              (auth) { question, options[] } → 설문 생성
GET  /api/polls/:id                 설문 상세 + 집계
POST /api/polls/:id/vote     (auth) { optionIndex } → 투표 (1인 1표)
POST /api/polls/:id/close    (auth) 설문 마감 (생성자만 가능)
GET  /api/polls/:id/messages        채팅 이력 조회
```

인증이 필요한 요청은 `Authorization: Bearer <token>` 헤더 필요.

## WebSocket 프로토콜

접속: `ws://localhost:3000/ws?token=<JWT>`

**Client → Server**
```json
{ "type": "join", "pollId": "..." }
{ "type": "chat", "pollId": "...", "message": "..." }
```

**Server → Client**
```json
{ "type": "connected", "username": "..." }
{ "type": "joined", "pollId": "..." }
{ "type": "vote_update", "pollId": "...", "results": [3,5,1], "total": 9 }
{ "type": "chat", "pollId": "...", "username": "...", "message": "...", "timestamp": 123 }
{ "type": "poll_closed", "pollId": "..." }
{ "type": "error", "error": "..." }
```

## 프로젝트 구조

```
live-poll/
├── server.js                 # 엔트리포인트 (Express + WS 서버 결합)
├── src/
│   ├── config.js             # 환경변수 설정
│   ├── db.js                 # 인메모리 저장소
│   ├── middleware/auth.js    # JWT 검증
│   ├── routes/
│   │   ├── auth.routes.js    # 회원가입/로그인
│   │   └── poll.routes.js    # 설문 CRUD + 투표
│   └── ws/wsServer.js        # WebSocket 서버 (join/chat/broadcast)
└── public/index.html         # 데모 클라이언트 (바닐라 JS)
```

## 향후 개선 (프로덕션 전환 시)

- 인메모리 → SQLite/Postgres 영속화
- Redis Pub/Sub으로 멀티 인스턴스 스케일링 (현재는 단일 프로세스 브로드캐스트)
- Refresh Token / Rate limiting
- 입력 값 검증 라이브러리(zod 등) 도입
