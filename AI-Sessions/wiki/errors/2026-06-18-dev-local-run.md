---
title: 로컬 dev 실행 실패 — 포트 점유·경로
category: errors
created: 2026-06-18
updated: 2026-06-18
status: active
sources: ["[[sources/implementation-v1]]"]
---

# 로컬 dev 실행 실패 — 포트 점유·경로

## 증상

- `npm run dev` → `ENOENT package.json` (repo 루트에서 실행)
- `EADDRINUSE :::3001` — 서버 즉시 크래시
- Vite만 5174/5175로 뜨고 Socket 연결 실패

## 원인

1. **실행 경로 오류** — `package.json`은 `davinci-code-web/`에만 있음
2. **포트 고정** — server `3001`, client `5173` (자동 변경 없음)
3. **좀비 node** — 이전 dev 서버·에이전트 백그라운드 프로세스가 포트 점유

## 해결

```bash
cd davinci-code-web
npm install
npm run dev
```

포트 충돌 시 (PowerShell):

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

분리 실행:

```bash
npm run dev -w server   # 터미널 1 → :3001
npm run dev -w client   # 터미널 2 → :5173
```

## 하지 말 것

- repo 루트(`DaVinciCode_Coda/`)에서 `npm run dev`
- 포트 랜덤 할당으로 우회 (프록시·Socket URL 불일치 유발) — **정책: 고정 포트 유지**
- `shared` 소스만 수정하고 `dist` 미빌드 상태로 서버 실행 (`applyPass` export 에러) — `npm run dev`가 자동 빌드함

## 확인

| 체크 | URL |
|------|-----|
| 서버 | http://localhost:3001/health → `{"ok":true}` |
| 클라이언트 | http://localhost:5173 |

## 관련

- [[sources/implementation-v1]]
- [[projects/project-davinci-code]]
