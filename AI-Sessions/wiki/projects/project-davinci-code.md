---
title: 다빈치코드 웹 보드게임
category: projects
created: 2026-06-18
updated: 2026-06-19
status: active
---

# 다빈치코드 웹 보드게임

## 진행률

- **v1 프로토타입**: 100% — tag `v1.0.0`, [[PROGRESS]]
- **v2 서버**: ~12% — [[Todo-Server]], [[dev-tasks/server-v2-phase-a-db]]

## 요약

브라우저 기반 실시간 멀티플레이어 다빈치코드. **모바일웹 세로 모드** 포함.

v1 배포 완료. v2는 PostgreSQL 영속화·ID/PW 인증·슬립 복구 작업 중.

## 코드

```
davinci-code-web/
├── client/   React + Vite + Tailwind
├── server/   Express + Socket.io (+ Drizzle/PostgreSQL v2)
└── shared/   타입 + 게임 룰
```

```bash
cd davinci-code-web && npm install && npm run dev
```

## 현재 단계

- [x] FirstPlan v0.6, Phase 0~4, 배포 v1.0.0
- [x] v2 Phase A — 로컬 DB·Drizzle 스키마
- [ ] v2 Phase B — 인증 API
- [ ] v2 Phase C~E — 영속화·cold start UX·QA

## 프로덕션

- 클라이언트: GitHub Pages
- 서버: Render Free (`davincicode-coda.onrender.com`)

## 관련 문서

- [[FirstPlan]]
- [[Todo-Server]]
- [[decisions/2026-06-19-server-v2-pre-impl]]
- [[PROGRESS]]
- [[concepts/game-rules]]
- [[decisions/2026-06-18-game-policy]]
- [[design/mobile-ux]]

## 변경 이력

- 2026-06-18: v0.5 — Phase 0~4 구현 완료
- 2026-06-19: v1.0.0 배포·릴리스
- 2026-06-19: v2 브랜치 — Phase A 로컬 DB 완료, 구현 전 결정 확정
