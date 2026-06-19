---
title: GitHub Pages + Render 배포 완료
category: dev-tasks
created: 2026-06-19
updated: 2026-06-19
status: completed
sources: ["[[DeployPlan]]", "[[README]]"]
---

# GitHub Pages + Render 배포 — 인수인계

## 프로덕션 URL

| 구분 | URL |
|------|-----|
| **클라이언트** | https://elkeipy.github.io/DaVinciCode_Coda/ |
| **서버** | https://davincicode-coda.onrender.com |
| **Health** | https://davincicode-coda.onrender.com/health |

## 아키텍처

```text
브라우저 → GitHub Pages (정적 SPA)
       → WebSocket → Render (Express + Socket.io, 인메모리)
```

## Render 환경 변수

| Key | 값 |
|-----|-----|
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | `https://elkeipy.github.io,http://localhost:5173` |

> `CLIENT_ORIGIN` trailing slash 없음. 콤마 구분 다중 origin 지원 (`server/src/corsOrigins.ts`).

## GitHub Actions

- 워크플로: `.github/workflows/deploy-pages.yml`
- 트리거: `main` push (`davinci-code-web/client|shared` 등 변경)
- 빌드: `npm ci && npm run build:pages`
- Variable (선택): `VITE_SOCKET_URL` = `https://davincicode-coda.onrender.com`

## 로컬 명령

```bash
cd davinci-code-web
npm run dev                    # 로컬 개발
npm run build:pages            # Pages 빌드 검증
npm run preview:pages -w client
npm run smoke:remote           # Render 소켓 스모크
npm run smoke:pages            # Pages origin CORS 스모크
```

## 배포 중 해결한 이슈

| 이슈 | 해결 |
|------|------|
| `shared` 빌드 시 vitest 타입 에러 | `tsconfig.json`에서 `*.test.ts` exclude |
| Render `@types/express` 누락 | `davinci-code-web/.npmrc` → `production=false` |
| CORS trailing slash 불일치 | `normalizeOrigin()` |
| Render Free 슬립 | EntryPage 90s 타임아웃·안내 문구 |

## QA (2026-06-19)

- [x] Pages 접속·닉네임 입장
- [x] 2인 방 생성·참가
- [x] 게임 시작~종료
- [ ] 15분+ 슬립 후 재접속 (미검증 — Free 티어 특성)

## 알려진 한계

- Render Free: 15분 무활동 시 슬립, cold start 30~90초
- 인메모리 상태: 서버 재시작 시 방·게임 초기화

## 관련 문서

- [[DeployPlan]]
- [[sources/implementation-v1]]
- [[errors/2026-06-18-dev-local-run]]
