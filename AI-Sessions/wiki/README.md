# Wiki — 가공 업무 지식

## 역할

LLM이 유지하는 **구조화·교차참조된 업무 위키**입니다.
Karpathy LLM Wiki의 **The wiki** 계층에 해당합니다.

에이전트가 작성·갱신합니다. 사람은 읽고 검토합니다.

## 카테고리

| 폴더 | 내용 | 저장 필터 |
|------|------|-----------|
| [[sources/README\|sources/]] | raw 요약·출처 카드 | 재사용, 인수인계 |
| [[concepts/README\|concepts/]] | 개념·용어·엔티티 | 재사용, 공통 규칙 |
| [[decisions/README\|decisions/]] | 의사결정 기록 | 추적, 인수인계 |
| [[errors/README\|errors/]] | 실패·리스크 | 리스크 |
| [[projects/README\|projects/]] | 프로젝트 맥락 | 인수인계, 재사용 |
| [[design/README\|design/]] | 디자인·팀 규칙 | 공통 규칙 |
| [[dev-tasks/README\|dev-tasks/]] | 개발 태스크 | 재사용, 인수인계 |

## 운영 원칙

1. 저장 전 **5가지 필터** 적용 (`CLAUDE.md` 참조)
2. 새 문서 작성 시 관련 기존 문서도 함께 갱신
3. 모순 발견 시 양쪽 문서에 명시
4. `index.md` 등록 + `log.md` 기록 필수

## Obsidian 활용

- **Graph view**: 연결 허브·고아 페이지 확인
- **Wikilink**: `[[문서명]]`으로 교차참조
- **Frontmatter**: Dataview 쿼리용 (선택)
