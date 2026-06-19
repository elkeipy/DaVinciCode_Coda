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

### Docker (선택)

```bash
npm run db:up
```

### 네이티브 설치 (Windows)

1. `Copy-Item .env.example .env` (최초 1회)
2. `.env`의 `POSTGRES_ADMIN_URL`에 **설치 시 postgres 비밀번호** 입력
3. 아래 순서 실행:

```powershell
npm run db:setup    # davinci / davinci_dev 생성
npm run db:push     # 테이블 생성
npm run db:check    # 연결 확인
```

| 명령 | 설명 |
|------|------|
| `npm run db:setup` | role·database 생성 (postgres 슈퍼유저 필요) |
| `npm run db:push` | Drizzle 스키마 → DB 반영 |
| `npm run db:check` | `DATABASE_URL` 연결 테스트 |
| `npm run db:up` | Docker Postgres (대안) |

연결: `postgresql://davinci:davinci@localhost:5432/davinci_dev`

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
