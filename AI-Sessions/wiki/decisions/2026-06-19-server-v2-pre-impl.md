---
title: 서버 v2 구현 전 의사결정
category: decisions
created: 2026-06-19
updated: 2026-06-19
status: confirmed
---

# 서버 v2 구현 전 의사결정

**기준선**: v1.0.0 (`main`)  
**작업 브랜치**: `feature/server-v2-persistence`  
**상세 계획**: [[Todo-Server]]

## 확정 사항 (2026-06-19)

| # | 항목 | 결정 |
|---|------|------|
| 1 | 세션 | **JWT only** — `auth_sessions` 테이블 없음 |
| 2 | 채팅 | **영속화 없음**. 게임 로그만 `GameState.actionLog` → `games.state_json` |
| 3 | disconnect | **자동 퇴장·탈락 없음**. 방장 **강퇴**만 예정 (`room:kick`, P1) |
| 4 | v1 닉네임 | **미지원** — v2.0부터 ID/PW 신규 가입만 |
| 5 | DB | **PostgreSQL** + Drizzle. Render → Supabase/Neon은 `DATABASE_URL`만 교체 |
| 6 | 로컬 DB | 네이티브 PG 18 (`db:setup` / `db:push` / `db:check` 성공) |

## 구현 중 기본값 (별도 확정 불필요)

- JWT 만료: 7일 (변경 가능)
- bcrypt cost: 12
- `room:kick`: Phase C 이후

## 다음 단계

**Phase B** — `POST /auth/register`, `/auth/login`, Socket `auth:token`, 클라 로그인 UI

## 관련

- [[Todo-Server]]
- [[dev-tasks/server-v2-phase-a-db]]
- [[projects/project-davinci-code]]
