---
title: Phase 0 — Monorepo 셋업
category: dev-tasks
created: 2026-06-18
updated: 2026-06-18
status: active
priority: P0
sources: ["[[FirstPlan]]", "[[sources/first-plan-v0.4]]"]
---

# Phase 0 — Monorepo 셋업

## 요약

다빈치코드 웹 프로토타입 코드베이스 초기화. 예상 1~2일.

## 완료 기준

- [ ] `client/` `server/` `shared/` npm workspaces 구조
- [ ] TypeScript + ESLint + Prettier 공통 설정
- [ ] Socket.io 클라이언트↔서버 연결 PoC
- [ ] `shared/types` 기본 인터페이스 (PlayerSession, Room)

## 작업 목록

| # | 작업 | 산출물 |
|---|------|--------|
| 1 | 루트 `package.json` workspaces | `davinci-code-web/` 구조 |
| 2 | `shared/package.json` + tsconfig | 타입 패키지 |
| 3 | `server/` Express + Socket.io 부트스트랩 | `:3001` 리스닝 |
| 4 | `client/` Vite React TS 템플릿 | `:5173` dev server |
| 5 | 클라이언트 `useSocket` 훅 PoC | connect/disconnect 로그 |
| 6 | Tailwind + safe-area 기본 설정 | [[design/mobile-ux]] 준비 |

## 의존성

- 없음 (첫 구현 태스크)

## 다음 태스크

- Phase 1 로비 → 입장·방 목록·채팅

## 관련 문서

- [[projects/project-davinci-code]]
- [[design/architecture-modularity]]
- [[FirstPlan]] §9 Phase 0
