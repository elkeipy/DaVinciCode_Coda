# Da Vinci Code Web

다빈치코드 실시간 멀티플레이어 웹 게임

## 실행 (v1 — 인메모리)

```bash
npm install
npm run dev
```

| 서비스 | URL |
|--------|-----|
| Client | http://localhost:5173 |
| Server | http://localhost:3001 |

> repo 루트가 아닌 **이 폴더**에서 실행.

## v2 로컬 DB (PostgreSQL)

서버 v2(`feature/server-v2-persistence`)부터 DB 필요. **Docker 권장** (Postgres 직접 설치 불필요).

```bash
# 1. Docker Desktop 실행 후
npm run db:up

# 2. 환경 변수
Copy-Item .env.example .env   # Windows PowerShell

# 3. 앱 실행 (DB 연동 코드는 Phase A 이후)
npm run dev
```

| 명령 | 설명 |
|------|------|
| `npm run db:up` | Postgres 컨테이너 기동 |
| `npm run db:down` | 컨테이너 중지 |
| `npm run db:logs` | DB 로그 |
| `npm run db:ps` | 상태 확인 |

연결 문자열: `postgresql://davinci:davinci@localhost:5432/davinci_dev`

Docker 없을 때 → repo 루트 `Todo-Server.md` §17 네이티브 설치 참고.

## 구조

```
client/   React + Vite + Tailwind
server/   Express + Socket.io
shared/   타입 + 게임 룰
```

## 테스트

```bash
npm test          # vitest (shared)
npm run test:e2e  # playwright (client)
```
