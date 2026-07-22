# ❤️ PulseVote (펄스보트)

> **심장 박동(BPM) 데이터 기반 실시간 반응형 투표 플랫폼**

PulseVote는 사용자의 생체 신호(심장 박동수, BPM) 및 반응 데이터를 WebSocket을 통해 실시간으로 수집하고, 투표 진행 상황 및 몰입도를 시각적으로 브로드캐스팅하는 차세대 투표 시스템입니다.

---

## 🌟 주요 기능 (Key Features)

- **⚡ 실시간 투표 및 스탯 브로드캐스팅**: Socket.io를 통해 투표 참여 현황과 실시간 통계를 전특 사용자에게 지연 없이 전달합니다.
- **💓 펄스(BPM) 하트비트 시뮬레이션**: 사용자의 심장 박동 데이터를 연동하여 투표의 실시간 열기/몰입도(Average BPM)를 산출합니다.
- **🎨 사이버펑크 펄스 테마**: 네온 핑크(`--pulse-red`)와 데이터 블루(`--data-blue`) 기반의 다크 모드 UI/UX 제공.
- **🔐 안전한 인증 시스템**: JWT 기반 Access Token / Refresh Token 구조 및 쿠키 관리.
- **🛡️ 안정적인 룸 관리**: WebSocket 연결 끊김 처리, 방 입장/퇴장 및 메모리 누수 방지 로직 구현.

---

## 📁 프로젝트 구조 (Project Structure)

```text
PulseVote/
├── public/                 # 프론트엔드 정적 파일
│   ├── index.html          # 클라이언트 대시보드 및 소켓 로직
│   └── style.css           # 펄스 네온 다크 테마 스타일시트
├── src/
│   ├── constants/          # 공통 상수 및 소켓 이벤트 정의
│   │   └── events.js
│   ├── controllers/        # API 요청 처리 컨트롤러
│   │   ├── auth.controller.js
│   │   └── poll.controller.js
│   ├── services/           # 비즈니스 로직 (투표 및 펄스 데이터 처리)
│   │   ├── poll.service.js
│   │   └── pulse.service.js
│   ├── websocket/          # 실시간 소켓 이벤트 핸들러 및 룸 관리자
│   │   ├── handler.js
│   │   └── roomManager.js
│   └── app.js              # Express 및 Server 설정
├── package.json
└── README.md
