# AI Agent Wiki Index

이 문서는 vault 전체의 **내용 지향 카탈로그**입니다.
에이전트는 wiki 문서를 만들거나 갱신한 뒤 반드시 이 문서에 링크를 추가합니다.

`query` 시 이 문서를 먼저 읽고 관련 페이지로 drill-down 합니다.

## Start Here

- [[START_HERE]] — 첫 실행 가이드
- [[HowToUse]] — 사람용 운영 매뉴얼
- [[CLAUDE]] — Claude Code 스키마
- [[AGENTS]] — Codex/기타 에이전트 스키마
- [[README]]
- [[FirstPlan]] — 다빈치코드 웹 개발 계획서 (v0.6, **턴 드로우 룰**)
- [[DeployPlan]] — 배포 계획 (**완료**)
- [[PROGRESS]] — 구현 진행률 **100%**
- [[TEMPLATE_MANIFEST]]
- [[log]] — 작업 타임라인

## 설계 원칙 (Karpathy LLM Wiki)

| 계층 | 경로 | 설명 |
|------|------|------|
| Raw | `AI-Sessions/raw/` | 불변 1차 자료. 에이전트는 읽기만 |
| Wiki | `AI-Sessions/wiki/` | LLM이 유지하는 가공 지식. 교차참조·합성 |
| Schema | `CLAUDE.md`, `AGENTS.md` | 구조·워크플로·저장 필터 |
| Index | 이 문서 | 위키 카탈로그 |
| Log | `log.md` | append-only 작업 이력 |

**핵심**: 위키는 매 질문마다 재발견하지 않는 **누적 산출물**입니다.
여러 AI 에이전트가 동일한 wiki를 공유해 업무 맥락을 이어갑니다.

## Vault Structure

```
AI-Sessions/
├── raw/              ← 1차 자료 (읽기 전용)
├── conversations/    ← 세션 인수인계 (임시)
└── wiki/
    ├── sources/      ← raw 요약
    ├── concepts/     ← 반복 개념·엔티티
    ├── decisions/    ← 의사결정
    ├── errors/       ← 실패·리스크
    ├── projects/     ← 프로젝트 맥락
    ├── design/       ← 디자인·팀 규칙
    └── dev-tasks/    ← 개발 태스크
```

각 폴더의 `README.md`에 용도와 저장 필터 매핑이 있습니다.

## 저장 필터 (요약)

wiki 저장 전 5가지 중 최소 1개 충족 필수. 상세는 [[CLAUDE]] 참조.

1. 재사용 — 향후 실무 반복 사용
2. 인수인계 — 이어받기 필수 정보
3. 추적 — 결정 근거·결정권자
4. 리스크 — 다시 시도하면 안 되는 실패
5. 공통 규칙 — 팀 디자인·운영 가이드

## Projects

- [[projects/project-davinci-code]] — 다빈치코드 웹 보드게임 (프로토타입)

## Decisions

- [[decisions/2026-06-18-game-policy]] — 추리 패널티·관전·4인 고정·조커·모바일 UX

## Sources

- [[sources/first-plan-v0.4]] — FirstPlan v0.4 요약·분해 인덱스
- [[sources/implementation-v1]] — davinci-code-web 구현 v1 (100%)

## Concepts

- [[concepts/game-rules]] — 흑백 타일·조커·추리 룰 (구현 SoT)

## Errors / Lessons

- [[errors/2026-06-18-dev-local-run]] — 로컬 dev 포트 점유·실행 경로
- [[errors/2026-06-19-socket-lobby-bugs]] — Socket 연결·방 생성 무반응

## Design / Rules

- [[design/architecture-modularity]] — Lobby / Room / Game 모듈 분리
- [[design/mobile-ux]] — 모바일웹 세로 보기 UX

## Dev Tasks

- [[dev-tasks/phase-0-monorepo-setup]] — Phase 0 ✅
- [[dev-tasks/implementation-complete]] — Phase 0~4 전체 구현 완료
- [[dev-tasks/deploy-render-pages]] — GitHub Pages + Render 배포 ✅

## Prompt Library

- [[prompts/first-setup]]
- [[prompts/save]]
- [[prompts/query]]
- [[prompts/ingest]]
- [[prompts/lint]]
