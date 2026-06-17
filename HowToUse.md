# AI-Agent-Wiki-Template

더미 데이터 없는 Obsidian AI 업무 위키 템플릿입니다.

이 템플릿은 사용자가 직접 폴더와 규칙을 모두 설계하지 않아도, Claude Code나 Codex 같은 에이전트에게 업무용 AI 위키 세팅을 맡길 수 있도록 구성되어 있습니다.

핵심 목적은 개인 메모 정리가 아니라, 여러 AI 에이전트가 같은 업무 맥락을 공유하는 안정적인 비즈니스 프로세스를 만드는 것입니다.

## 빠른 시작

1. 이 폴더를 내려받아 압축을 풉니다.
2. Obsidian에서 `Open folder as vault`를 선택합니다.
3. 이 폴더를 vault로 엽니다.
4. Claude Code 또는 Codex를 이 폴더에서 실행합니다.
5. `START_HERE.md`의 첫 실행 프롬프트를 에이전트에게 붙여넣습니다.

## 추천 사용 순서

1. 먼저 빈 템플릿 상태로 에이전트에게 구조 점검을 맡깁니다.
2. `raw/`에 실제 자료를 조금만 넣고 `ingest`를 테스트합니다.
3. `save`, `query`, `lint`가 예상대로 동작하는지 확인합니다.
4. 그 다음 실제 프로젝트 자료를 단계적으로 추가합니다.

## 포함된 것

- 빈 raw 저장소
- 빈 wiki 저장소
- 세션 인수인계 폴더
- Claude Code용 `CLAUDE.md`
- Codex용 `AGENTS.md`
- vault 지도 `index.md`
- 작업 로그 `log.md`
- 복사해서 쓰는 첫 실행 프롬프트 `START_HERE.md`
- 상황별 프롬프트 모음 `prompts/`
- 템플릿 검증 스크립트 `scripts/validate-template.sh`

## 포함하지 않는 것

- 예시 고객 정보
- 예시 프로젝트
- 예시 회의록
- 개인 메모
- API 키나 토큰

## 폴더 구조

```text
AI-Agent-Wiki-Template/
├── CLAUDE.md
├── AGENTS.md
├── START_HERE.md
├── README.md
├── VERSION
├── index.md
├── log.md
├── prompts/
├── scripts/
└── AI-Sessions/
    ├── raw/
    ├── conversations/
    └── wiki/
        ├── sources/
        ├── concepts/
        ├── decisions/
        ├── errors/
        ├── projects/
        ├── design/
        └── dev-tasks/
```

## 중요한 운영 원칙

- `raw/`는 불변 자료 저장소입니다. 에이전트가 원본을 수정하지 않게 하세요.
- `wiki/`는 가공된 지식 저장소입니다. 요약, 결정, 프로젝트 맥락은 여기에 둡니다.
- 모든 저장은 5가지 저장 필터를 통과해야 합니다.
- 사람이 읽는 규칙은 한국어로, 에이전트 명령 키워드는 `save`, `ingest`, `query`, `lint`처럼 영어로 고정합니다.

## 배포 전 검증

터미널에서 아래 명령을 실행합니다.

```bash
./scripts/validate-template.sh
```

검증 스크립트는 필수 파일과 폴더가 있는지, 템플릿에 더미 데이터로 오해될 수 있는 파일이 섞이지 않았는지 확인합니다.
