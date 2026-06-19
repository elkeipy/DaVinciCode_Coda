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

> repo 루트가 아닌 **이 폴더**에서 실행. `npm run dev` 시 shared 자동 빌드 후 서버·클라 기동.

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
