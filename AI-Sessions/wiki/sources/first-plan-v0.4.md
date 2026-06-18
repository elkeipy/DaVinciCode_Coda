---
title: FirstPlan v0.4 요약
category: sources
created: 2026-06-18
updated: 2026-06-18
status: active
sources: ["[[FirstPlan]]"]
---

# FirstPlan v0.4 — 출처 카드

## 원본

- **파일**: [[FirstPlan]] (vault 루트)
- **버전**: 0.4 (모바일웹·세로 UX 반영)
- **작성일**: 2026-06-18

## 핵심 takeaway

1. **프로토타입 범위**: 닉네임만, 인메모리, 로비 → 방 → 게임
2. **스택**: TS monorepo — React+Vite / Node+Express / Socket.io
3. **게임 룰**: 흑백 타일·조커·3~4장·숫자/조커 추리 → [[concepts/game-rules]]
4. **정책 D1~D6** → [[decisions/2026-06-18-game-policy]]
5. **모바일**: 세로 보기 기본 → [[design/mobile-ux]]
6. **아키텍처**: Lobby / Room / Game 분리 → [[design/architecture-modularity]]

## wiki 분해 문서

| 주제 | 문서 |
|------|------|
| 프로젝트 허브 | [[projects/project-davinci-code]] |
| 게임 룰 SoT | [[concepts/game-rules]] |
| 의사결정 | [[decisions/2026-06-18-game-policy]] |
| 모바일 UX | [[design/mobile-ux]] |
| 다음 구현 | [[dev-tasks/phase-0-monorepo-setup]] |

## 다음 액션 (원본 §13)

- Phase 0 monorepo 스캐폴딩
- `shared/rules` TDD (2인 기준)

## 관련 문서

- [[projects/project-davinci-code]]
- [[FirstPlan]]
