---
title: Socket·로비 UX 버그 — 연결·방 생성
category: errors
created: 2026-06-19
updated: 2026-06-19
status: active
sources: ["[[errors/2026-06-18-dev-local-run]]", "[[sources/implementation-v1]]"]
---

# Socket·로비 UX 버그 — 연결·방 생성

## 증상

- 입장 화면 `서버 연결 중…` 고정
- 로비 입장·방 만들기 버튼 무반응
- `concurrently` → `spawn cmd.exe ENOENT`

## 원인

| 이슈 | 원인 |
|------|------|
| 연결 중 고정 | `useSocket`이 `useAppStore()` 전체를 effect deps로 사용 → 매 렌더마다 리스너 제거 |
| concurrently 실패 | Windows에서 `cmd.exe` spawn 실패 |
| 클라 먼저 기동 | `dev.mjs`가 서버 health 전에 Vite 시작 → Socket 프록시 `ECONNREFUSED` |
| 방 생성 무반응 | `room:state` 대기 없이 `lobby`만 폴링; 이미 방에 있으면 서버 silent fail |
| 재접속 | `lobby:rejoin` 후 방에 있는데 로비 UI 유지 → 방 생성 `Already in a room` |

## 해결 (코드 반영됨)

- `scripts/dev.mjs` — 서버 `:3001` health 후 클라이언트 `:5173`
- `useSocket` — `useAppStore.getState()` + `[]` deps
- `EntryPage` / `LobbyPage` — 연결·생성 실패 시 에러·타임아웃
- `room:create` — 생성 직후 `room:state` emit, 실패 시 error emit
- `room:join` — 동일 방 재요청 허용

## 관련

- [[errors/2026-06-18-dev-local-run]]
- [[sources/implementation-v1]]
