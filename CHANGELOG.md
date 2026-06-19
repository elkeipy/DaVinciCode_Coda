# Changelog

## [1.0.0] — 2026-06-19

프로토타입 v1.0 — GitHub Pages + Render 배포 완료, 2인 플레이 QA 통과.

### Added

- `davinci-code-web` monorepo (client / server / shared)
- 실시간 멀티플레이어: 로비, 방, 채팅, 게임 전체 룰
- FirstPlan v0.6 + 룰 10 (턴 드로우, 추리 성공 후 재추리/패스)
- GitHub Pages 클라이언트 배포 (`.github/workflows/deploy-pages.yml`)
- Render 서버 배포 (`davincicode-coda.onrender.com`)
- 배포 스모크 스크립트 (`smoke-remote`, `smoke-pages`)

### Live URLs

- Play: https://elkeipy.github.io/DaVinciCode_Coda/
- API: https://davincicode-coda.onrender.com

### Known limitations

- Render Free: 15분 무활동 시 슬립 (cold start 30~90초)
- 인메모리 게임 상태 — 서버 재시작 시 방·게임 초기화

### Docs

- [[DeployPlan]], [[dev-tasks/deploy-render-pages]]

[1.0.0]: https://github.com/elkeipy/DaVinciCode_Coda/releases/tag/v1.0.0
