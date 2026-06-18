# Da Vinci Code Web

다빈치코드 실시간 멀티플레이어 웹 게임 (FirstPlan v0.4 구현)

## 실행

```bash
npm install
npm run dev
```

| 서비스 | URL |
|--------|-----|
| Client | http://localhost:5173 |
| Server | http://localhost:3001 |

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
