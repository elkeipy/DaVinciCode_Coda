---
title: 모바일웹 UX (세로 보기)
category: design
created: 2026-06-18
updated: 2026-06-18
status: active
sources: ["[[FirstPlan]]"]
decision_by: 사용자
---

# 모바일웹 UX — 세로 보기

## 요약

프로토타입부터 **모바일 브라우저 세로(portrait) 모드**를 1차 타깃으로 한다. 데스크톱·가로는 확장 레이아웃.

## 결정 (D6)

- **모바일웹 지원** 필수 (P0)
- **세로 보기 기본** — 한 손 조작·thumb zone 우선
- iOS Safari safe-area 대응

## 레이아웃 (게임방 세로)

```text
┌─────────────────────┐
│ 방제목 · 인원        │
├─────────────────────┤
│ 상대 보드 (스크롤)   │
├─────────────────────┤
│ 내 보드 + 턴 표시    │
├─────────────────────┤
│ [추리] [패스]       │  ← MobileActionBar (고정)
├─────────────────────┤
│ 채팅 (접기/펼치기)   │
└─────────────────────┘
```

## 화면별

| 화면 | 모바일 패턴 |
|------|-------------|
| 입장 | 전체 너비 입력 + 큰 CTA 버튼 |
| 로비 | 방 타일 1열 스택, 접속자 접이식 패널 |
| 게임방 | 세로 스택, 추리 UI = bottom sheet |
| 조커 배치 | 탭-위치 선택 또는 드래그 앤 드롭 |

## 구현 체크리스트

- [ ] `viewport-fit=cover` + `safe-area-inset`
- [ ] 터치 타깃 ≥ 44px
- [ ] `dvh` 단위로 주소창 높이 변동 대응
- [ ] `touch-action: manipulation`
- [ ] Tailwind `sm:` / `md:` 데스크톱 2열 확장

## 컴포넌트

- `PortraitGameLayout.tsx`
- `MobileActionBar.tsx`
- `GuessPanel` bottom sheet 변형

## 관련 문서

- [[FirstPlan]] §5.5
- [[decisions/2026-06-18-game-policy]]
- [[projects/project-davinci-code]]
