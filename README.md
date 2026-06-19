# DaVinciCode_Coda

다빈치코드 웹 보드게임 — 실시간 멀티플레이어 프로토타입 **v1.0.0**

## 문서

- [[FirstPlan]] — 전체 계획·기능 요구사항 (v0.5, **100%**)
- [[PROGRESS]] — 구현 진행률
- [[projects/project-davinci-code]] — 프로젝트 위키 (진입점)
- [[sources/first-plan-v0.4]] — FirstPlan v0.4 요약
- [[concepts/game-rules]] — 적용 게임 룰 (구현 기준)

## 스택

TypeScript · React + Vite · Node.js + Socket.io · monorepo

## 실행

```bash
cd davinci-code-web
npm install
npm run dev
```

## 배포 (라이브)

| | URL |
|--|-----|
| **플레이** | https://elkeipy.github.io/DaVinciCode_Coda/ |
| **API** | https://davincicode-coda.onrender.com |
| **health** | https://davincicode-coda.onrender.com/health |


```text
CLIENT_ORIGIN:  https://elkeipy.github.io,http://localhost:5173
VITE_SOCKET_URL https://davincicode-coda.onrender.com

```

상세: [[DeployPlan]], [[dev-tasks/deploy-render-pages]]

릴리스: [v1.0.0](https://github.com/elkeipy/DaVinciCode_Coda/releases/tag/v1.0.0) · [[CHANGELOG]]