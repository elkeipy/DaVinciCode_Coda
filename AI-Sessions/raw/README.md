# Raw — 1차 자료 저장소

## 역할

회의록, 스펙, 이메일, 웹 클립, PDF 등 **불변 1차 자료**를 보관합니다.
Karpathy LLM Wiki의 **Raw sources** 계층에 해당합니다.

## 규칙

- 에이전트는 **읽기만** 합니다. 생성·수정·삭제 금지.
- 사람이 자료를 여기에 넣은 뒤 `ingest` 명령으로 wiki로 정리합니다.
- 원본 파일명은 유지하세요. 날짜 접두사 권장: `YYYY-MM-DD-주제.ext`

## 권장 하위 구조 (선택)

```
raw/
├── meetings/       회의록·전사
├── specs/          요구사항·스펙
├── clips/          웹 클립·기사
└── assets/         이미지·첨부 (Obsidian attachment folder로 지정 가능)
```

## 다음 단계

자료 추가 후 에이전트에게 `ingest`를 요청하세요.
