---
title: 아키텍처 모듈 분리 원칙
category: design
created: 2026-06-18
updated: 2026-06-18
status: active
sources: ["[[FirstPlan]]"]
---

# 아키텍처 모듈 분리 원칙

## 요약

로비·방·게임이 독립 모듈로 분리되어, 이후 기능 개선 시 영향 범위를 최소화한다.

## 서버 모듈

| 모듈 | 책임 |
|------|------|
| `LobbyManager` | 접속자, 방 목록, 로비 채팅 |
| `RoomManager` | 방 생성/입장/퇴장, 방 채팅 |
| `GameEngine` | 룰, 턴, 타일, 승패 (Room에 주입) |

## 클라이언트 모듈

| 영역 | 경로 |
|------|------|
| 로비 | `components/lobby/*` |
| 게임 | `components/game/*` |
| 공통 | `components/common/*` |

## 공유

- `shared/types` — PlayerSession, Room, Tile, GameState
- `shared/rules` — 배분, 정렬, 추리 검증 (서버가 최종 판정)

## 원칙

1. Lobby / Room / Game **관심사 분리**
2. **Server-Authoritative** — 클라이언트는 intent만 전송
3. 게임방·로비 개선이 서로의 내부 구현에 의존하지 않도록 **인터페이스 경계** 유지

## 관련 문서

- [[projects/project-davinci-code]]
- [[FirstPlan]]
