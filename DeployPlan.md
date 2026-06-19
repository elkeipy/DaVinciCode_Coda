# DeployPlan — 다빈치코드 웹 배포 계획서

> **결정 사항**: 클라이언트 **GitHub Pages** · 서버 **Render**  
> **대상**: `davinci-code-web/` monorepo (React + Vite / Express + Socket.io)  
> **작성일**: 2026-06-19  
> **상태**: Phase 0~3 구현 완료 · Phase 4 (프로덕션 연동) 대기

---

## 1. 요약

| 항목 | 선택 | URL 예시 |
|------|------|----------|
| 클라이언트 | GitHub Pages | `https://elkeipy.github.io/DaVinciCode_Coda/` |
| 서버 | Render Web Service | `https://davincicode-coda.onrender.com` |
| 통신 | Socket.io (WebSocket) | 클라 빌드 시 `VITE_SOCKET_URL`로 서버 URL 주입 |

GitHub Pages는 **정적 파일만** 호스팅한다. Express + Socket.io 서버는 Render에 별도 배포한다.

---

## 2. 아키텍처

```text
[브라우저] ──HTTPS──► GitHub Pages (client/dist)
     │
     └── WebSocket (Socket.io) ──► Render (server)
                                        │
                                        └── In-Memory AppStore
```

### 데이터 흐름

1. 사용자가 GitHub Pages URL 접속 → React SPA 로드
2. `socket.io-client`가 `VITE_SOCKET_URL`(Render)에 연결
3. 게임 룰·상태는 **서버 권위** (`shared/rules` → `server/store.ts`)
4. CORS: 서버가 `CLIENT_ORIGIN`(Pages URL)만 허용

---

## 3. 현재 코드 상태 vs 배포 요구사항

### 3.1 이미 갖춰진 것

| 항목 | 위치 | 비고 |
|------|------|------|
| 포트 환경변수 | `server/src/index.ts` | `PORT` (Render 자동 주입) |
| CORS / Socket.io origin | `server/src/index.ts` | `CLIENT_ORIGIN`, `NODE_ENV=production` |
| 소켓 URL 환경변수 | `client/src/hooks/useSocket.ts` | `VITE_SOCKET_URL` |
| Health check | `GET /health` | Render 헬스체크·Playwright용 |
| Monorepo 빌드 스크립트 | `davinci-code-web/package.json` | `build` (shared → server → client) |

### 3.2 배포 전 **반드시** 수정·추가할 것

| # | 작업 | 이유 | 우선순위 | 상태 |
|---|------|------|----------|------|
| 1 | `client/vite.config.ts`에 `base` 설정 | GitHub Pages는 서브경로(`/DaVinciCode_Coda/`) 서빙 | P0 | ✅ |
| 2 | `BrowserRouter`에 `basename` | SPA 라우트(`/lobby`, `/room/:id`) 404 방지 | P0 | ✅ |
| 3 | 빌드 후 `404.html` = `index.html` 복사 | GitHub Pages SPA fallback | P0 | ✅ |
| 4 | GitHub Actions 워크플로 생성 | Pages 자동 배포 | P0 | ✅ |
| 5 | Render Web Service 생성 + env 설정 | 서버 호스팅 | P0 | ✅ |
| 6 | `CLIENT_ORIGIN` = Pages URL | 프로덕션 CORS | P0 | Phase 4 |
| 7 | 클라 빌드 시 `VITE_SOCKET_URL` = Render URL | 소켓 연결 대상 | P0 | ✅ |
| 8 | Render `render.yaml` (선택) | IaC·재현성 | P1 | |
| 9 | 슬립 대응 UX (연결 중·재시도 메시지) | Render 무료 티어 15분 슬립 | P1 | |
| 10 | `index.md` / wiki 배포 문서 링크 | 인수인계 | P2 | ✅ |

### 3.3 수정 불필요 (오해 방지)

- **Vite dev proxy** (`/socket.io` → localhost): 개발 전용. 프로덕션은 `VITE_SOCKET_URL` 직접 연결.
- **shared/dist**: gitignore 대상. CI·Render 빌드 시 `npm run build -w shared` 선행 필수.

---

## 4. 클라이언트 배포 — GitHub Pages

### 4.1 URL 형태 결정

| Pages 유형 | `base` 값 | 예시 URL |
|------------|-----------|----------|
| **Project site** (이 repo) | `/DaVinciCode_Coda/` | `https://elkeipy.github.io/DaVinciCode_Coda/` |
| User/Org site (`<user>.github.io` repo) | `/` | `https://elkeipy.github.io/` |

> 아래 절차는 **Project site** 기준. repo 이름이 바뀌면 `base`도 동일하게 맞출 것.

### 4.2 코드 변경 (예시)

**`client/vite.config.ts`**

```typescript
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/DaVinciCode_Coda/' : '/',
  // ...기존 plugins, server
});
```

**`client/src/main.tsx`**

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

**`client/package.json` — build 스크립트 보강**

```json
"build:pages": "tsc -b && vite build && cp dist/index.html dist/404.html"
```

Windows CI에서는 `cp` 대신 cross-platform 스크립트 사용 권장.

### 4.3 GitHub Actions 워크플로 (개요)

파일: `.github/workflows/deploy-pages.yml`

```yaml
name: Deploy Client to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'davinci-code-web/client/**'
      - 'davinci-code-web/shared/**'
      - '.github/workflows/deploy-pages.yml'

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: davinci-code-web/package-lock.json
      - name: Install and build for Pages
        working-directory: davinci-code-web
        env:
          VITE_SOCKET_URL: ${{ vars.VITE_SOCKET_URL || 'https://davincicode-coda.onrender.com' }}
        run: npm ci && npm run build:pages
      - uses: actions/upload-pages-artifact@v3
        with:
          path: davinci-code-web/client/dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 4.4 GitHub 저장소 설정

1. **Settings → Pages → Build and deployment**: Source = **GitHub Actions**
2. **Settings → Secrets and variables → Actions → Variables**  
   - `VITE_SOCKET_URL` = `https://<render-service>.onrender.com` (trailing slash 없음)
3. 첫 배포 후 Pages URL 확정 → 서버 `CLIENT_ORIGIN`에 동일 값 설정

### 4.5 클라이언트 빌드 명령 (로컬 검증)

```bash
cd davinci-code-web
npm ci
npm run build -w shared
GITHUB_PAGES=true VITE_SOCKET_URL=https://<render-host>.onrender.com npm run build -w client
# Windows PowerShell:
# $env:GITHUB_PAGES='true'; $env:VITE_SOCKET_URL='https://...'; npm run build -w client
npx vite preview -w client --base /DaVinciCode_Coda/
```

---

## 5. 서버 배포 — Render

### 5.1 서비스 유형

- **Web Service** (Docker 불필요, Node 네이티브)
- Region: Singapore 또는 Frankfurt (한국 사용자 latency 고려)
- Instance: **Free** (프로토타입)

### 5.2 Render 대시보드 설정

| 필드 | 값 |
|------|-----|
| Root Directory | `davinci-code-web` |
| Runtime | Node |
| Build Command | `npm install && npm run build -w shared && npm run build -w server` |
| Start Command | `npm run start -w server` |
| Health Check Path | `/health` |

### 5.3 환경 변수

| 변수 | 값 | 필수 |
|------|-----|------|
| `NODE_ENV` | `production` | ✅ |
| `CLIENT_ORIGIN` | `https://<user>.github.io` 또는 `https://<user>.github.io/DaVinciCode_Coda` | ✅ |
| `PORT` | (Render 자동) | 자동 |

> `CLIENT_ORIGIN`은 **프로토콜·호스트·경로까지** Pages 실제 origin과 일치해야 함.  
> trailing slash 없이 설정 (`https://elkeipy.github.io/DaVinciCode_Coda` — Pages는 보통 path만 origin에 포함 안 함. **실제 브라우저 `location.origin`으로 확인**).

### 5.4 `render.yaml` (선택 — repo 루트 또는 `davinci-code-web/`)

```yaml
services:
  - type: web
    name: davinci-code-api
    runtime: node
    rootDir: davinci-code-web
    buildCommand: npm install && npm run build -w shared && npm run build -w server
    startCommand: npm run start -w server
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: CLIENT_ORIGIN
        sync: false
```

### 5.5 Render 무료 티어 제약 (중요)

| 제약 | 영향 | 대응 |
|------|------|------|
| **15분 무활동 시 슬립** | 첫 접속 30~90초 cold start | UI에 "서버 깨우는 중…" 표시, `connect_error` 재시도 |
| 월 실행 시간 한도 | 트래픽 많으면 제한 | 유료 플랜 또는 Fly.io 검토 |
| 단일 인스턴스 | 수평 확장 불가 | 인메모리 설계와 일치 (현재 OK) |
| 재배포·크래시 | 방·게임 상태 전부 소실 | 프로토타입 수용, 추후 Redis/DB |

### 5.6 서버 배포 순서

1. Render Web Service 생성 (main 브랜치 연동)
2. env 없이 배포 → `https://xxx.onrender.com/health` 확인
3. `CLIENT_ORIGIN` 임시 `http://localhost:5173` → 로컬 클라로 스모크 테스트 가능
4. GitHub Pages 배포 후 `CLIENT_ORIGIN`을 Pages URL로 변경
5. GitHub Actions `VITE_SOCKET_URL`을 Render URL로 설정 → 클라 재배포

---

## 6. CORS · Socket.io 체크리스트

현재 서버 (`server/src/index.ts`):

```typescript
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
const isDev = process.env.NODE_ENV !== 'production';
const corsOrigin = isDev ? true : CLIENT_ORIGIN;
```

프로덕션 검증 항목:

- [ ] `NODE_ENV=production` 설정됨
- [ ] `CLIENT_ORIGIN`이 Pages origin과 **정확히** 일치
- [ ] Socket.io 연결 시 Network 탭에서 WebSocket upgrade 101
- [ ] `lobby:join` 후 `session:assigned` 수신
- [ ] HTTPS Pages → HTTPS Render (mixed content 없음)

**다중 origin** (로컬 + Pages 동시)이 필요하면 `CLIENT_ORIGIN`을 콤마 구분 리스트로 파싱하도록 서버 수정 검토.

---

## 7. 배포 단계 (롤아웃 플랜)

### Phase 0 — 사전 준비 (0.5일) ✅

- [x] Render 계정·GitHub repo 연동
- [x] GitHub Pages Actions 권한 활성화
- [x] 배포용 브랜치 정책: `main` push 시 자동 배포

### Phase 1 — 서버만 배포 (0.5일) ✅

- [x] Render Web Service 생성 (`davincicode-coda.onrender.com`)
- [x] `/health` 응답 확인 (`{"ok":true}`)
- [x] Render 소켓 스모크 (`scripts/smoke-remote.mjs` — `lobby:join` 성공)

### Phase 2 — 클라이언트 코드 수정 (0.5일) ✅

- [x] `base` / `basename` / `404.html` 적용
- [x] `build:pages` 스크립트 (`scripts/build-client-pages.mjs`)
- [x] 로컬 `npm run build:pages` 빌드 검증 (`/DaVinciCode_Coda/` asset 경로)

### Phase 3 — GitHub Pages CI (0.5일) ✅

- [x] Actions 워크플로 추가 (`.github/workflows/deploy-pages.yml`)
- [x] `VITE_SOCKET_URL` — workflow 기본값 + repo Variable 권장
- [ ] 첫 배포 성공 확인 (push 후 Actions 탭에서 확인)

### Phase 4 — 프로덕션 연동 (0.5일)

- [ ] `CLIENT_ORIGIN` 최종 설정
- [ ] 2인 이상 실제 플레이 테스트 (로비 → 방 → 게임 → 재시작)
- [ ] 슬립 후 재접속 시나리오 테스트

### Phase 5 — 문서·인수인계 (0.25일)

- [ ] wiki `AI-Sessions/wiki/dev-tasks/deploy-render-pages.md` 작성 (선택)
- [ ] `log.md` 한 줄 추가
- [ ] `PROGRESS.md` 또는 이 문서 상태를 `implemented`로 갱신

**예상 총 소요**: 2~3일 (여유 포함)

---

## 8. 테스트 계획

### 8.1 배포 전 (로컬)

```bash
cd davinci-code-web
npm test                    # shared 단위 테스트
npm run build -w shared
npm run build -w server
NODE_ENV=production CLIENT_ORIGIN=http://localhost:4173 npm run start -w server
# 다른 터미널: 프로덕션 빌드 클라 preview
```

### 8.2 배포 후 (프로덕션)

| # | 시나리오 | 기대 결과 |
|---|----------|-----------|
| 1 | Pages 접속 | Entry 화면 로드, 콘솔 에러 없음 |
| 2 | 닉네임 입장 | 로비 이동, "서버 연결 중" 무한 대기 없음 |
| 3 | 방 생성·참가 | 2탭/2브라우저 동기화 |
| 4 | 게임 시작~종료 | 턴·추리·패스·승리 정상 |
| 5 | 새로고침 | `lobby:rejoin` 복구 (같은 sessionId) |
| 6 | 15분+ 미사용 후 접속 | cold start 후 연결 (지연 허용 범위 문서화) |
| 7 | `/room/xxx` 직접 URL | 404 없이 게임방 또는 리다이렉트 |

### 8.3 자동화 (선택)

- Playwright E2E는 현재 `localhost` 고정 → CI에서 Pages+Render 스모크는 별도 job으로 분리 가능
- Render health check는 `/health`로 유지

---

## 9. 보안·운영 메모

| 항목 | 현재 | 프로덕션 권장 |
|------|------|----------------|
| 인증 | 닉네임만 | 프로토타입 OK |
| Rate limit | 없음 | Render 앞 Cloudflare 또는 express-rate-limit 검토 |
| 채팅 XSS | React escape | 입력 길이 제한 추가 권장 |
| HTTPS | Pages·Render 기본 제공 | 추가 작업 없음 |
| 비밀정보 | env만 사용 | `.env` 커밋 금지 |

---

## 10. 알려진 한계 (프로토타입 수용)

1. **인메모리 상태** — 서버 재시작 시 모든 방·게임 초기화
2. **Render Free 슬립** — 멀티 대기 중 긴 공백 후 불편
3. **단일 리전** — 해외 Render 리전 시 latency
4. **GitHub Pages 캐시** — 배포 후 1~2분 전파 지연 가능
5. **동시 접속** — 무료 인스턴스 CPU/RAM 한도 내에서만 안정

---

## 11. 추후 개선 (배포 v2)

| 개선 | 목적 |
|------|------|
| Render 유료 / Fly.io 이전 | 슬립 제거 |
| Redis + 세션/방 영속화 | 재시작 복구 |
| 커스텀 도메인 (Pages + Render) | URL 정리 |
| `CLIENT_ORIGINS` 다중 origin | 스테이징 환경 |
| Dependabot + CI test gate | 배포 품질 |
| Sentry / 로그 수집 | 장애 추적 |

---

## 12. 빠른 참조 — 명령·URL 템플릿

```text
# 로컬 개발
cd davinci-code-web && npm run dev

# GitHub Pages용 클라 빌드 (로컬 검증)
cd davinci-code-web
$env:VITE_SOCKET_URL='https://davincicode-coda.onrender.com'
npm run build:pages
npm run preview:pages -w client

# 프로덕션 URL
CLIENT (Pages):  https://elkeipy.github.io/DaVinciCode_Coda/
SERVER (Render): https://davincicode-coda.onrender.com
HEALTH:          https://davincicode-coda.onrender.com/health

# GitHub Actions Variable (Phase 3)
VITE_SOCKET_URL=https://davincicode-coda.onrender.com

# Render Env
NODE_ENV=production
CLIENT_ORIGIN=https://elkeipy.github.io
```

---

## 13. 관련 문서

- [[FirstPlan]] §3.4 배포 참고
- [[sources/implementation-v1]] — 구현 구조
- [[errors/2026-06-18-dev-local-run]] — 로컬 실행
- [[errors/2026-06-19-socket-lobby-bugs]] — 소켓 이슈 교훈

---

## 14. 결정 로그

| 날짜 | 결정 |
|------|------|
| 2026-06-19 | 클라 GitHub Pages + 서버 Render로 확정 |
| 2026-06-19 | Phase 0~1 완료 — Render `davincicode-coda.onrender.com`, health·소켓 스모크 통과 |
| 2026-06-19 | Phase 2 완료 — `base`/`basename`/`build:pages`/`404.html` |

---

*다음 작업: **Phase 4** — Render `CLIENT_ORIGIN`을 `https://elkeipy.github.io`로 변경 후 Pages에서 플레이 테스트.*
