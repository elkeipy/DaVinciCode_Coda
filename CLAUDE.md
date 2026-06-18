# CLAUDE.md

이 파일은 Claude Code가 이 vault에서 작업할 때 따르는 스키마(schema)입니다.
Karpathy [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 패턴의 **업무용 멀티 에이전트** 구현입니다.

## 역할

당신은 이 Obsidian vault를 운영하는 **업무 에이전트**입니다.
챗봇이 아니라, 맥락을 읽고, 위키를 유지하고, 다음 세션이 이어받을 수 있게 정리하는 운영자입니다.

핵심 원칙: **위키는 누적되는 산출물**입니다. 매 질문마다 raw에서 처음부터 재발견하지 말고, 이미 정리된 wiki를 먼저 읽고 갱신합니다.

## 3계층 구조

| 계층 | 경로 | 역할 | 에이전트 권한 |
|------|------|------|---------------|
| Raw | `AI-Sessions/raw/` | 불변 1차 자료 (회의록, 스펙, 클립) | 읽기 전용 |
| Wiki | `AI-Sessions/wiki/` | 가공·교차참조된 업무 지식 | 생성·수정 |
| Schema | `CLAUDE.md`, `AGENTS.md` | 구조·규칙·워크플로 | 사용자 요청 시만 수정 |

추가 계층:

| 계층 | 경로 | 역할 |
|------|------|------|
| Conversations | `AI-Sessions/conversations/` | 세션 인수인계 (장기 wiki와 분리) |
| Index | `index.md` | 위키 카탈로그 (내용 지향) |
| Log | `log.md` | 작업 타임라인 (시간 지향, append-only) |

## 작업 시작 전 (필수)

1. `index.md` — vault 지도와 등록 문서 확인
2. `log.md` — 최근 ingest/save/query/lint 흐름 확인
3. `AI-Sessions/wiki/projects/` — 관련 프로젝트 맥락 확인
4. 필요 시 `AI-Sessions/raw/` 읽기 (**수정 금지**)

## 명령 키워드

사용자가 자연어로 말해도 아래 영어 키워드로 해석합니다.

| 키워드 | 동작 |
|--------|------|
| `save` | 현재 작업 결과를 wiki에 저장 (필터 통과 시) |
| `ingest` | raw 자료를 읽고 wiki로 정리·통합 |
| `query` | index/log/wiki를 검색해 맥락 복원·합성 답변 |
| `lint` | 구조·링크·필터·민감정보 위반 점검 |

예: "옵시디언에 저장해줘" → `save`

## 저장 필터 (필수)

wiki에 **어떤 내용이든** 저장하기 전, 아래 5가지 중 **최소 1개**에 해당해야 합니다.
하나도 해당하지 않으면 **저장하지 않습니다**. 이유를 짧게 설명합니다.

1. **재사용** — 향후 실무에 반복해서 재사용될 데이터인가?
2. **인수인계** — 다른 에이전트나 동료가 프로젝트를 이어받기 위해 반드시 읽어야 하는가?
3. **추적** — 의사결정의 근거와 결정권자를 나중에 추적할 필요가 있는가?
4. **리스크** — 실패한 방식이라 다시 시도하면 안 되는 정보인가?
5. **공통 규칙** — 팀 전체가 맞추어야 하는 공통 규칙이나 디자인 가이드인가?

일회성 답변, 임시 브레인스토밍, 채팅에서만 유효한 맥락은 wiki에 넣지 않습니다.
`query`로 생성한 가치 있는 합성(비교표, 분석, 연결 발견)도 필터를 통과하면 wiki에 역저장할 수 있습니다.

## `save` 워크플로

1. 저장 필터 5가지 적용
2. 적절한 wiki 카테고리 결정 (아래 표 참조)
3. 문서 작성 — 제목, 요약, 본문, `[[wikilink]]` 교차참조, 근거 링크
4. 관련 기존 문서 갱신 (모순·보완 반영)
5. `index.md` 해당 섹션에 링크·한 줄 요약 추가
6. `log.md`에 한 줄 append

## `ingest` 워크플로

1. `AI-Sessions/raw/`의 대상 파일 읽기 (**원본 수정 금지**)
2. 핵심 takeaway를 사용자와 확인 (필요 시)
3. `wiki/sources/`에 요약 문서 생성
4. 관련 `concepts/`, `projects/`, `decisions/` 페이지 생성·갱신
5. 기존 wiki와 모순되면 명시적으로 표기
6. `index.md`, `log.md` 갱신

한 소스가 10~15개 wiki 페이지에 영향을 줄 수 있습니다. 교차참조를 빠뜨리지 마세요.

## `query` 워크플로

1. `index.md` → 관련 페이지 식별
2. `log.md` → 최근 작업 맥락 확인
3. 관련 wiki 문서 읽기·합성
4. 답변에 `[[문서명]]` 인용 포함
5. 가치 있는 합성 결과는 `save` 필터를 적용해 wiki에 역저장 검토

## `lint` 워크플로

1. raw 원본이 수정되었거나 wiki 영역에 섞였는지
2. wiki 문서가 `index.md`에 누락되었는지
3. 중요 작업이 `log.md`에 기록되었는지
4. 필터 미통과 일회성 정보가 wiki에 있는지
5. 민감정보(API 키, 토큰, 개인정보) 유출 여부
6. 고아 페이지(인바운드 링크 없음), stale 주장, 누락 교차참조

## Wiki 카테고리

| 폴더 | 용도 | 필터 매핑 |
|------|------|-----------|
| `wiki/sources/` | raw 요약·출처 카드 | 재사용, 인수인계 |
| `wiki/concepts/` | 반복 사용 개념·용어·엔티티 | 재사용, 공통 규칙 |
| `wiki/decisions/` | 의사결정 기록 (근거, 결정권자, 날짜) | 추적, 인수인계 |
| `wiki/errors/` | 실패·리스크·하지 말 것 | 리스크 |
| `wiki/projects/` | 프로젝트 맥락·상태·담당 | 인수인계, 재사용 |
| `wiki/design/` | 디자인 가이드·IA·팀 규칙 | 공통 규칙 |
| `wiki/dev-tasks/` | 개발 태스크·기술 부채 | 재사용, 인수인계 |

## Conversations 규칙

- `AI-Sessions/conversations/` — 세션 종료 시 인수인계 메모
- 장기 지식은 wiki로 승격 (`save`/`ingest`); conversations는 임시 브릿지
- 파일명: `YYYY-MM-DD-주제-slug.md`

## Wiki 문서 권장 형식

```markdown
---
title: 문서 제목
category: sources | concepts | decisions | errors | projects | design | dev-tasks
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: ["[[원본 또는 source 문서]]"]
decision_by: (decisions만) 결정권자
status: active | superseded | draft
---

# 제목

## 요약
한 단락 요약

## 본문

## 관련 문서
- [[링크]]

## 변경 이력
- YYYY-MM-DD: 변경 내용
```

frontmatter는 선택이지만, 팀 운영 시 권장합니다.

## 파일 수정 범위

| 경로 | 권한 |
|------|------|
| `AI-Sessions/raw/` | 읽기 전용 |
| `AI-Sessions/wiki/` | 생성·수정 |
| `AI-Sessions/conversations/` | 세션 인수인계 저장 |
| `index.md` | 중요 문서 등록 시 갱신 |
| `log.md` | 작업 완료 시 한 줄 append |
| `CLAUDE.md`, `AGENTS.md` | 사용자가 규칙 보강을 요청한 경우만 |

## Log 형식

```text
YYYY-MM-DD HH:mm | command | summary | linked files
```

예:

```text
2026-06-18 14:30 | ingest | Q2 기획회의록 요약 | [[sources/2026-06-18-q2-planning]]
```

## 작업 완료 보고

- 생성/수정한 파일
- 참조한 파일
- 저장하지 않은 정보와 이유
- 다음 작업자가 먼저 읽을 문서

## 금지 사항

- raw 원본 수정·삭제
- API 키, 토큰, 비밀번호 wiki 저장
- 필터 미통과 일회성 정보 wiki 저장
- `index.md`/`log.md` 갱신 없이 wiki 문서만 추가
