---
title: 다빈치코드 웹 보드게임
category: projects
created: 2026-06-18
updated: 2026-06-18
status: active
---

# 다빈치코드 웹 보드게임

## 요약

브라우저 기반 실시간 멀티플레이어 다빈치코드. **모바일웹 세로 모드** 포함. 닉네임만으로 로비 → 방 → 게임.

## 목표

- 로비 / 게임방 / 실시간 채팅
- Server-Authoritative 게임 룰
- monorepo: `client` + `server` + `shared`

## 적용 룰 (확정)

상세: [[concepts/game-rules]], 결정: [[decisions/2026-06-18-game-policy]]

| 항목 | 내용 |
|------|------|
| 타일 | 0~11 숫자, 흰색/검은색, 조커(`-`) |
| 배분 | 2~3인: 4장 / 4인: 3장 |
| 조커 | 대표 숫자 선택 + 위치 배치 (본인) |
| 추리 실패 | 서버 자동 타일 공개 |
| 탈락 후 | 관전 — 대기 또는 퇴장 |
| 최대 인원 | **4인 고정** |
| 게임 종료 | 방 대기 복귀, 방장 재시작 |
| UX | **모바일웹 세로 기본** (D6) |

## 기술 스택

| 영역 | 선택 |
|------|------|
| 언어 | TypeScript |
| 프론트 | React 18 + Vite + Zustand + Tailwind |
| 백엔드 | Node.js + Express + Socket.io |
| 구조 | npm workspaces monorepo |

## 화면

| 화면 | 경로 |
|------|------|
| 입장 | `/` |
| 로비 | `/lobby` |
| 게임방 | `/room/:roomId` |

## 현재 단계

- [x] FirstPlan v0.4 (모바일 세로 UX)
- [x] 게임 정책 결정 (D1~D6)
- [ ] Phase 0 monorepo 스캐폴딩
- [ ] Phase 1 로비
- [ ] Phase 2 게임방 셸
- [ ] Phase 3 게임 코어

## 다음 작업자 가이드

1. [[sources/first-plan-v0.4]] — 계획서 인덱스
2. [[dev-tasks/phase-0-monorepo-setup]] — **다음 구현 태스크**
3. [[concepts/game-rules]] — 룰 SoT
4. [[decisions/2026-06-18-game-policy]] — D1~D6

## 관련 문서

- [[FirstPlan]]
- [[concepts/game-rules]]
- [[decisions/2026-06-18-game-policy]]
- [[design/architecture-modularity]]
- [[design/mobile-ux]]

## 변경 이력

- 2026-06-18: 프로젝트 등록, 룰 v0.2 (흑백·조커·3~4장)
- 2026-06-18: v0.3 — 조커 배치, 자동 패널티, 관전 모드, 4인 고정
- 2026-06-18: v0.4 — 모바일웹 세로 UX (D6)
- 2026-06-18: wiki save — sources·dev-tasks·conversations 인수인계 정리
