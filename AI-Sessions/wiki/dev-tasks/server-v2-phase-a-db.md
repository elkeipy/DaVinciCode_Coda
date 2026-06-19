---
title: 서버 v2 Phase A — DB 인프라
category: dev-tasks
created: 2026-06-19
updated: 2026-06-19
status: in-progress
---

# 서버 v2 Phase A — DB 인프라

**브랜치**: `feature/server-v2-persistence`  
**계획 SoT**: [[Todo-Server]] §9 Phase A

## 완료

- [x] 작업 브랜치 생성
- [x] Drizzle 스키마 — `users`, `rooms`, `room_members`, `games`
- [x] `scripts/db.mjs`, `setup-native-db.mjs`, `check-db.mjs`, `load-env.mjs`
- [x] 루트 `npm run db:setup` / `db:push` / `db:check`
- [x] 로컬 네이티브 PostgreSQL 18 — setup·push·check **성공**
- [x] `.env.example` — `POSTGRES_ADMIN_URL`, `DATABASE_URL`, `JWT_SECRET`

## 미완료

- [ ] Render Postgres (프로덕션·스테이징)
- [ ] `Repository` 인터페이스 + `AppStore` 연동

## 로컬 실행

```bash
cd davinci-code-web
# .env에 POSTGRES_ADMIN_URL, DATABASE_URL 설정 후
npm run db:setup
npm run db:push
npm run db:check
```

## 스키마 위치

`davinci-code-web/server/src/db/schema.ts`

## 다음

Phase B — 인증 API ([[decisions/2026-06-19-server-v2-pre-impl]])
