---
title: 서버 v2 — 영속화·인증·슬립 복구
status: planning
baseline: v1.0.0
updated: 2026-06-19
sources: ["[[FirstPlan]]", "[[DeployPlan]]", "[[dev-tasks/deploy-render-pages]]"]
---

# Todo-Server — 요구사항·진행도·구현 계획

> **최종 목표**: Render Free 슬립(cold start 30~90초) 이후에도 플레이어가 **이전 방·게임 상태로 완전 복구**되고, 계정은 **ID/PW** 기반으로 관리된다.

**기준선**: 프로토타입 `v1.0.0` (인메모리 `AppStore`, 닉네임 로그인)  
**참고**: [[FirstPlan]] §3.3 — DB·OAuth는 프로토타입에서 제외했으나, 본 작업에서 **정식 전환 1단계**로 도입

---

## 1. 요약

| 영역 | v1.0.0 (현재) | v2 (목표) |
|------|---------------|-----------|
| 상태 저장 | `AppStore` 메모리 | **PostgreSQL** (Render → Supabase/Neon 이전 가능) |
| 인증 | 닉네임 + `sessionId` (localStorage) | **ID/PW** + 세션 토큰 |
| 슬립 후 복구 | ❌ 세션·게임 소실 | ✅ DB에서 방·게임·플레이어 복원 |
| cold start UX | 90s 타임아웃·안내 문구만 | **헬스 폴링 + 진행 UI** |
| 데이터 삭제 | disconnect 시 탈락 처리 | 게임 종료·방 퇴장 시만 삭제 |
| v1 닉네임 계정 | — | **미지원** (신규 ID/PW만) |

**전체 진행도**: `~12%` — Phase A 로컬 DB 완료, §12 구현 전 결정 확정, Phase B 대기

**작업 브랜치**: `feature/server-v2-persistence` (`main`은 v1.0.0 유지)

---

## 2. 배경 · 문제 정의

### 2.1 Render Free 슬립

- Web Service **15분 무활동** → 프로세스 종료
- 다음 요청 시 **cold start 30~90초**
- 프로세스 종료 시 **메모리 전부 소실** → 방·게임·세션 증발

### 2.2 현재 복구 한계 (`v1.0.0`)

| 기능 | 코드 위치 | 슬립 후 |
|------|-----------|---------|
| `lobby:rejoin` | `server/index.ts` | `sessions` Map 없으면 `SESSION_EXPIRED` |
| `davinci_sessionId` | `client` localStorage | 서버에 데이터 없어 무의미 |
| disconnect 처리 | `store.removeSocket()` | 게임 중 끊기면 **즉시 탈락** — 복구 목표와 충돌 |

### 2.3 FirstPlan과의 관계

FirstPlan §3.3에서 PostgreSQL·JWT를 **의도적 제외**했으나, Todo 목표는 프로토타입 이후 단계에 해당.  
게임 룰(`shared/rules`)은 유지하고 **저장·인증 계층만** 교체하는 것이 원칙.

---

## 3. 기능 요구사항

### 3.1 슬립·cold start 대응 (클라이언트)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| R-C1 | cold start 동안 **서버 깨우기 대기 UI** (진행 표시, 30~90초 안내) | P0 |
| R-C2 | `GET /health` **폴링**으로 서버 기동 확인 후 Socket 연결 | P0 |
| R-C3 | 연결 성공 후 **자동 rejoin** (저장된 token/user) | P0 |
| R-C4 | 실패 시 재시도 버튼·에러 메시지 | P1 |

> v1.0.0: `EntryPage` 90s 타임아웃·슬립 문구만 존재 → **폴링·단계별 UI**로 확장 필요

### 3.2 상태 복구 (서버)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| R-S1 | 로그인 후 **방 소속·게임 진행 상태** DB에서 조회 | P0 |
| R-S2 | 복구 시 `room:state`, `game:state` 재전송 (`actionLog` 포함). 채팅 히스토리 복구 **없음** | P0 |
| R-S3 | 슬립·disconnect 시 **자동 퇴장·탈락 없음** (방장 강퇴만 별도 구현 예정) | P0 |
| R-S4 | 서버 기동 시 DB에서 **진행 중 방·게임** 메모리로 hydrate | P0 |

### 3.3 데이터 생명주기

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| R-D1 | **게임 종료** 시 해당 `game` 레코드 삭제 (또는 archived) | P0 |
| R-D2 | **방 퇴장** 시 해당 플레이어의 방·게임 참여 정보 삭제 | P0 |
| R-D3 | 로비·방 **채팅** 영속화 **없음** | ✅ 확정 |
| R-D4 | **게임 진행 로그**(`GameState.actionLog`)만 `state_json`에 포함·게임 종료 시 함께 삭제 | P0 |

### 3.4 인증 (ID/PW)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| R-A1 | 회원가입: **loginId**(고유) + **password** + **displayName**(표시용) | P0 |
| R-A2 | 로그인: ID/PW 검증 → **세션 토큰** 발급 | P0 |
| R-A3 | Socket 연결 시 토큰으로 사용자 식별 (`lobby:join` 대체) | P0 |
| R-A4 | 비밀번호 **단방향 해시** 저장 (평문 저장 금지) | P0 |
| R-A5 | 로그아웃·세션 만료 | P1 |

### 3.5 방장 강퇴 (예정)

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| R-K1 | 방장이 플레이어 **강퇴** (`room:kick` 등) | P1 (v2.0 이후 가능) |

> **자동 퇴장**(disconnect N분 후 방에서 제거)은 **계획 없음**.

> **v1 닉네임 로그인 호환 없음** — v2.0부터 ID/PW만 지원 (§12 확정)

---

## 4. 비기능 요구사항

| ID | 항목 | 목표 |
|----|------|------|
| NF-1 | cold start 체감 | 90초 내 연결 성공률 UX 보장 (대기 UI) |
| NF-2 | 복구 정확도 | 동일 방·동일 턴·동일 타일 상태 (서버 권위 유지) |
| NF-3 | 보안 | bcrypt/argon2, HTTPS, 토큰 HttpOnly 권장 |
| NF-4 | Render Free 한계 | Postgres Free **30일 만료** — 장기 운영 시 유료·이전 검토 |
| NF-5 | 단일 인스턴스 | 수평 확장·Redis는 v2 범위 **외** |
| NF-6 | **DB 이식성** | `DATABASE_URL`만 바꿔 Supabase/Neon 이전 가능 (§5.3) |

---

## 5. DB 선택 — Render 환경

### 5.1 MariaDB vs PostgreSQL

| 옵션 | Render 지원 | 권장 |
|------|-------------|------|
| **Managed PostgreSQL** | ✅ Free(30일)·유료 | **✅ 1순위 (초기)** |
| Managed MariaDB | ❌ 없음 | — |
| MariaDB 직접 설치 + Persistent Disk | ⚠️ 직접 운영·백업 부담 | 비권장 |
| Redis (Key Value) | ✅ | v2 범위 외 (보조 캐시만 검토) |

**결론**: 원안 "MariaDB"는 Render 미지원 → **PostgreSQL** 기준 설계.

### 5.2 Free Postgres 제약 (2026 기준)

- 1GB / 256MB RAM / 워크스페이스당 1개
- **생성 30일 후 만료·데이터 삭제** (유료 업그레이드 또는 `pg_dump` 백업)
- 백업·HA 없음

→ **취미·단기 검증용 OK**. 30일 전 **Supabase/Neon 이전** 또는 Render 유료(~$7/월) 검토.

### 5.3 Provider 이식성 (Supabase · Neon)

추후 **Supabase** 또는 **Neon**으로 옮길 수 있도록, 벤더 종속 로직을 서버에 두지 않는다.

| 원칙 | 구현 |
|------|------|
| 연결 | 표준 **`DATABASE_URL`** (Postgres URI) 하나만 사용 |
| ORM | **Drizzle** + `drizzle-kit` migrate (Prisma 대비 SQL·이전 유연) |
| 스키마 | Postgres 표준 타입·JSONB만 사용 (Render 전용 확장 금지) |
| 비즈니스 로직 | `Repository` 인터페이스 뒤에 DB 접근 — `AppStore`가 직접 SQL 호출 안 함 |
| Render 전용 API | 사용하지 않음 (Supabase Auth 등 **v2에서 미사용**, 자체 JWT 유지) |

**이전 시 작업** (코드 변경 최소):

```text
1. Supabase/Neon에서 Postgres 생성
2. pg_dump (Render) → psql (신규) 데이터 이전
3. Render Web Service env: DATABASE_URL 만 교체
4. 마이그레이션 재실행 (스키마 동기화)
```

| Provider | 장점 (이 프로젝트 기준) |
|----------|-------------------------|
| **Render Postgres** | Web Service와 같은 대시보드, 초기 셋업 빠름 |
| **Supabase** | Auth·Realtime 내장 (추후 옵션), Free 티어 상대적 여유 |
| **Neon** | 서버리스 Postgres, branch·scale, Free 장기 운영 사례 많음 |

---

## 6. 인증 설계 제안

### 6.1 비밀번호 암호화

| 방식 | 권장 | 이유 |
|------|------|------|
| **bcrypt** (cost 12) | ✅ 기본 추천 | Node `bcrypt`/`bcryptjs` 성숙, 구현 단순 |
| **argon2id** | ✅ 대안 | OWASP 권장, `argon2` npm 패키지 |
| SHA-256 단독 | ❌ | 레인보우 테이블 취약 |
| AES 양방향 | ❌ | 비밀번호 저장에 부적합 |

```text
회원가입: hash = bcrypt(password, rounds=12)
로그인:   bcrypt.compare(input, storedHash)
```

### 6.2 세션 모델 — **JWT 확정**

```text
[회원가입/로그인] → HTTP POST /auth/login → { token, userId, displayName }
[Socket]          → auth: { token } → 서버가 userId·activeSession 복원
```

| 저장소 | 내용 |
|--------|------|
| `users` | id, login_id, password_hash, display_name, created_at |

- **✅ JWT only** — `auth_sessions` DB 테이블 **없음** (단순·Render 슬립 후에도 stateless 복원)
- `JWT_SECRET` env, 만료 예: 7일 (`exp` claim)
- 로그아웃: 클라이언트 token 삭제 (서버 블랙리스트는 v2 범위 외)

#### JWT란? (요약)

**JSON Web Token** — 로그인 성공 시 서버가 주는 **서명된 문자열 신분증**.

```text
eyJhbGciOiJIUzI1NiIs...  ← 점(.)으로 이어진 긴 문자열
```

| 특징 | 설명 |
|------|------|
| 내용 | `userId`, `loginId`, 만료시간 등 (JSON → Base64) |
| 서명 | 서버만 아는 `JWT_SECRET`으로 위조 방지 |
| 저장 | 클라 localStorage `davinci_token` (또는 메모리) |
| 사용 | API·Socket 요청마다 "나 userId=xxx" 증명 |

**왜 쓰나**: DB에 세션 행을 안 남겨도 됨. Render 슬립 후 서버가 깨어나도 토큰만 검증하면 사용자 식별 가능.

**세션 DB 대비 단점**: 토큰 탈취 시 만료 전까지 revoke 어려움 → v2에서는 로그아웃=클라 삭제로 충분.

### 6.3 loginId vs displayName

- `loginId`: 로그인용, **고유**, 변경 어려움
- `displayName`: 게임 내 표시 (기존 nickname 역할), **중복 허용**

---

## 7. 데이터 모델 (초안)

```text
users
  id, login_id, password_hash, display_name, created_at

rooms
  id, title, host_user_id, status, max_players, created_at

room_members
  room_id, user_id, joined_at

games
  id, room_id, state_json (JSONB), phase, schema_version, updated_at
  -- state_json.actionLog = 게임 진행 로그 (채팅 아님)
```

- **`state_json`**: `GameState` 직렬화 (`actionLog` 포함). 룰 판정은 `shared/rules` 유지.
- **채팅**(`lobbyChats`, `roomChats`): 영속화 **안 함** — 재접속 시 빈 상태.
- **`schema_version`**: JSONB 스키마 변경 시 마이그레이션용 (NF-2).

### 7.1 삭제 정책

| 이벤트 | DB 동작 |
|--------|---------|
| `game:reset` / 게임 종료 후 대기 | `games` 삭제 (`actionLog` 포함) |
| `room:leave` | `room_members` 삭제; 빈 방이면 `rooms`·`games` 정리 |
| disconnect / 슬립 | **자동 퇴장 없음** — `room_members` 유지 |
| `room:kick` (예정) | 방장 강퇴 시에만 `room_members` 삭제 |
| 회원 탈퇴 (추후) | cascade 또는 soft delete |

---

## 8. 아키텍처 (목표)

```text
[Client] ──HTTPS──► /auth/* (회원가입·로그인)
       ──WS──────► Socket.io (auth:token)
                        │
                        ▼
                 [Game Server]
                   ├── AuthService
                   ├── RoomService
                   ├── GameEngine (shared/rules — 변경 없음)
                   └── PersistenceRepository  ◄── 인터페이스
                            │
                            ▼
              [PostgreSQL — Render | Supabase | Neon]
                   DATABASE_URL 만 교체
```

**기동 시**: `hydrateActiveGames()` — DB → `AppStore` 메모리 로드.

---

## 9. 구현 계획 (단계)

### Phase A — 인프라·DB (1~2일)

- [x] 작업 브랜치 `feature/server-v2-persistence` 생성
- [x] 로컬 Postgres — Docker Compose **또는** 네이티브(PG 18) 설치
- [x] `.env.example` / `.env` (`DATABASE_URL`, `POSTGRES_ADMIN_URL`, `JWT_SECRET`)
- [x] Drizzle 스키마 (`server/src/db/schema.ts`) — users, rooms, room_members, games
- [x] `npm run db:setup` / `db:check` / `db:push` 스크립트
- [x] **로컬 DB 생성 완료** — `db:setup` + `db:push` + `db:check` (네이티브 PG 18)
- [ ] Render Postgres 생성 (프로덕션·스테이징)
- [ ] `Repository` 인터페이스 + `AppStore` 연동

**진행도**: ~60% (로컬 DB·스키마·도구 완료, Repository·Render DB 대기)

### Phase B — 인증 API (2~3일)

- [ ] `POST /auth/register`, `/auth/login`, `/auth/logout`
- [ ] bcrypt, loginId 유니크
- [ ] JWT (`JWT_SECRET`)
- [ ] Socket `auth:token` — `lobby:join`(닉네임) **제거**
- [ ] 클라: 로그인·회원가입 UI, `davinci_token`

**진행도**: 0%

### Phase C — 영속화·복구 (3~4일)

- [ ] Repository 경유 read/write (`AppStore` 리팩터)
- [ ] 방·게임 이벤트마다 DB upsert
- [ ] startup hydrate
- [ ] `removeSocket`: disconnect 시 **탈락·퇴장 처리 제거** (v1 동작 변경)
- [ ] token 기반 rejoin → room/game/chat 복원

**진행도**: 0%

### Phase D — cold start UX (1일)

- [ ] `useServerWake`: `/health` 폴링 (2s, 최대 90s)
- [ ] UI: `깨우는 중` → `연결 중` → `복구 중`
- [ ] 복구 후 `/lobby` 또는 `/room/:id` 자동 이동

**진행도**: 0%

### Phase E — QA·문서 (1일)

- [ ] 슬립 후 2인 게임 복구 E2E
- [ ] wiki·CHANGELOG **v2.0.0**
- [ ] (선택) `pg_dump` 이전 절차 문서화 — Supabase/Neon dry-run

**진행도**: 0%

**예상 총 소요**: 8~11일

---

## 10. 진행도 대시보드

| Phase | 내용 | 상태 | % |
|-------|------|------|---|
| A | Postgres·Drizzle·Repository | 🔄 스키마·스크립트 완료 | 40 |
| B | ID/PW 인증 | ⏳ 미착수 | 0 |
| C | 영속화·슬립 복구 | ⏳ 미착수 | 0 |
| D | cold start UX | ⏳ 미착수 | 0 |
| E | QA·릴리스 | ⏳ 미착수 | 0 |
| **합계** | | **준비 중** | **~8%** |

---

## 11. v1.0.0 대비 변경 파일 (예상)

| 영역 | 파일 |
|------|------|
| 서버 | `store.ts` → Repository 주입 |
| 서버 | `index.ts` — auth, hydrate |
| 서버 | `db/schema.ts`, `db/repository.ts`, `db/migrate.ts` **신규** |
| 서버 | `auth/*` **신규** |
| 클라 | `EntryPage` — 로그인/회원가입 (닉네임 단독 입장 제거) |
| 클라 | `useSocket`, `sessionStore` — token |
| shared | `User`, `AuthToken` 타입 (선택) |
| env | `DATABASE_URL`, `JWT_SECRET` |

---

## 12. 리스크 · 의사결정

| 항목 | 리스크 | 대응 |
|------|--------|------|
| Postgres Free 30일 만료 | 데이터 소실 | Supabase/Neon 이전 또는 유료·`pg_dump` |
| JSONB 스키마 변경 | 마이그레이션 복잡 | `schema_version` + 스크립트 |
| disconnect vs 탈락 | v1은 끊기면 탈락 | disconnect **유지**, 강퇴는 방장만 (R-K1) |
| **v1 닉네임 계정** | — | **✅ 확정: 미지원** (v2.0 신규 가입만) |
| MariaDB 기대 | Render 미지원 | PostgreSQL 확정 (§5.1) |
| 벤더 lock-in | Supabase 이전 어려움 | 자체 Auth + Drizzle + `DATABASE_URL` only (§5.3) |

### ✅ 확정 (2026-06-19)

| # | 항목 | 결정 |
|---|------|------|
| 1 | 세션 | **JWT only** (§6.2) |
| 2 | 채팅 | **영속화 없음**. 게임 로그만 `GameState.actionLog` → `state_json` |
| 3 | disconnect | **자동 퇴장 없음**. 방장 **강퇴**만 예정 (R-K1) |

---

## 13. 원본 Todo 매핑

| 원본 항목 | 본 문서 |
|-----------|---------|
| cold start 대기 | §3.1, Phase D |
| 로그인 시 방·게임 복구 | §3.2, Phase C |
| 게임 종료·방 퇴장 시 삭제 | §3.3, §7.1 |
| 인메모리 → DB | §5~7, Phase A·C |
| MariaDB | §5.1 → PostgreSQL |
| ID/PW + 암호화 | §3.4, §6 |
| Supabase/Neon 이전 | §5.3, NF-6 |

---

## 14. 관련 문서

- [[FirstPlan]]
- [[DeployPlan]]
- [[dev-tasks/deploy-render-pages]]
- [[sources/implementation-v1]]
- [[CHANGELOG]]

---

## 15. 다음 액션

1. Docker Desktop 설치 후 `npm run db:up` 로컬 DB 기동 확인
2. **Phase A** — Drizzle 스캐폴드 + 첫 마이그레이션
3. (나중) Render Postgres + `DATABASE_URL` (배포용)

---

## 17. 로컬 개발 환경

### 17.1 권장: Docker (Postgres 직접 설치 불필요)

**필요**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows)

```powershell
cd davinci-code-web
npm run db:up
Copy-Item .env.example .env
npm run db:ps          # healthy 확인
```

| 항목 | 값 |
|------|-----|
| Host | `localhost:5432` |
| DB | `davinci_dev` |
| User / PW | `davinci` / `davinci` |
| URL | `postgresql://davinci:davinci@localhost:5432/davinci_dev` |

데이터는 Docker volume `davinci_pg_data`에 유지. 초기화: `docker compose down -v` (주의: 데이터 삭제).

### 17.2 네이티브 설치 (현재 환경 — PostgreSQL 18)

1. 설치 완료 ✅ (`C:\Program Files\PostgreSQL\18\`)
2. `.env`에서 **한 줄만** 수정:
   ```text
   POSTGRES_ADMIN_URL=postgresql://postgres:설치시비밀번호@localhost:5432/postgres
   ```
3. DB·유저 생성:
   ```powershell
   cd davinci-code-web
   npm run db:setup
   ```
4. 테이블 생성:
   ```powershell
   npm run db:push
   ```
5. 확인:
   ```powershell
   npm run db:check
   ```
   → `OK: connected as davinci to davinci_dev` + 테이블 4개

수동 SQL (스크립트 대신):
```sql
CREATE ROLE davinci LOGIN PASSWORD 'davinci';
CREATE DATABASE davinci_dev OWNER davinci;
```

### 17.3 v1 vs v2 로컬 실행

| 브랜치 | DB | 실행 |
|--------|-----|------|
| `main` | 불필요 | `npm run dev` 만으로 OK |
| `feature/server-v2-persistence` | `db:up` 필요 (Phase A 이후 코드 연동) | `.env` + `npm run dev` |

> Phase A Drizzle 연동 전까지는 **v1 인메모리**로 `npm run dev` 동작. DB는 미리 띄워두어도 무방.

### 17.4 브랜치 워크플로

```powershell
# v2 작업
git checkout feature/server-v2-persistence

# v1 핫픽스 (필요 시)
git checkout main
# ... 수정 후 main에 merge
git checkout feature/server-v2-persistence
git merge main
```

---

## 16. 변경 이력 (계획서)

| 날짜 | 변경 |
|------|------|
| 2026-06-19 | 초안 작성 |
| 2026-06-19 | Supabase/Neon 이식성 (§5.3, NF-6) 반영 |
| 2026-06-19 | v1 닉네임 호환 **미지원** 확정 |
| 2026-06-19 | `feature/server-v2-persistence` 브랜치, Docker Postgres 로컬 셋업 |
| 2026-06-19 | §12 확정 — JWT only, 채팅 미저장·actionLog만, 자동퇴장 없음·방장 강퇴 예정 |
| 2026-06-19 | Phase A 로컬 DB 완료 (`db:setup`/`push`/`check`), 구현 전 결정 마감 → Phase B 대기 |

*마지막 갱신: 2026-06-19*
