---
title: davinci-code-web 구현 v1
category: sources
created: 2026-06-18
updated: 2026-06-18
status: active
sources: ["[[FirstPlan]]", "[[PROGRESS]]"]
---

# davinci-code-web 구현 v1 — 출처 카드

## 원본

- **경로**: `davinci-code-web/` (monorepo)
- **진행률**: [[PROGRESS]] — **100% (17/17)**

## 구조

| 패키지 | 역할 |
|--------|------|
| `client/` | React + Vite + Tailwind, 모바일 세로 UX |
| `server/` | Express + Socket.io, Server-Authoritative |
| `shared/` | 타입, deck/sort/gameLogic 룰 |

## 실행

```bash
cd davinci-code-web && npm install && npm run dev
```

## 핵심 Socket 이벤트

- `lobby:join` / `lobby:rejoin`
- `room:create` / `room:join` / `room:leave`
- `game:start` / `game:placeJoker` / `game:guess` / `game:pass` / `game:reset`
- `chat:send`

## 테스트

- `npm test` — shared vitest (4 tests)
- `npm run test:e2e` — Playwright (2 tests)

## 관련 문서

- [[projects/project-davinci-code]]
- [[concepts/game-rules]]
- [[decisions/2026-06-18-game-policy]]
- [[design/mobile-ux]]
- [[design/architecture-modularity]]

## 다음 액션

- 실플레이 QA (2~4인)
- 배포 (Vercel + Railway)
