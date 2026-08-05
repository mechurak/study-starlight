# 배포

**Cloudflare Pages + GitHub 연동**으로 `main`에 푸시하면 자동 배포된다.
브랜치를 밀면 그 브랜치의 preview URL이 따로 생긴다.

| | 주소 |
|---|---|
| **커스텀 도메인 (정식)** | <https://study.upggu.com> |
| Pages 기본 도메인 | <https://study-starlight.pages.dev> |

둘 다 살아 있지만 `astro.config.mjs`의 `site`가 커스텀 도메인이라
**양쪽 모두 canonical이 `study.upggu.com`을 가리킨다** — 검색엔진이 한 주소로 모은다.

## 최초 연결 (대시보드에서 한 번만)

Git 연결은 OAuth 승인이 필요해서 **대시보드에서만** 할 수 있다 (CLI/API 불가).

1. Cloudflare 대시보드 → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. GitHub 로그인 → `mechurak/study-starlight` 선택 → **Install & Authorize** → **Begin setup**
3. 빌드 설정을 아래처럼 넣는다

   | 항목 | 값 |
   |---|---|
   | Framework preset | Astro |
   | Build command | `pnpm build` |
   | Build output directory | `dist` |
   | Production branch | `main` |

4. **Settings → Environment variables 에 반드시 추가** (아래 참고)

   | 변수 | 값 |
   |---|---|
   | `PNPM_VERSION` | `11.20.0` |

## 왜 `PNPM_VERSION`을 박아야 하나

- `pnpm-workspace.yaml`의 **`allowBuilds`는 pnpm 10.26.0에서 들어온 문법**인데
  (그 전에는 `onlyBuiltDependencies`),
  Cloudflare v3 빌드 이미지의 기본 pnpm은 **10.11.1** 이다 → 필드를 무시하고
  **esbuild·sharp의 빌드 스크립트가 막혀 빌드가 깨진다**
- v3 이미지는 **`pnpm-lock.yaml`에서 pnpm 버전을 자동 감지하지 않는다.** 직접 지정해야 한다
- Node 버전은 `.nvmrc`(현재 `24`)로 고정된다 — 이건 파일이라 대시보드 설정이 필요 없다

## 도메인을 바꿀 때

**`astro.config.mjs`의 `site`를 반드시 같이 고친다.** canonical 링크와 sitemap이
전부 이 값으로 생성되기 때문에, 안 고치면 새 도메인의 페이지가
옛 도메인을 canonical로 가리켜 검색엔진이 그쪽을 색인한다.

```bash
# 배포 후 확인
curl -s https://study.upggu.com/ | grep -o '<link rel="canonical"[^>]*>'
curl -s https://study.upggu.com/sitemap-0.xml | grep -o '<loc>[^<]*</loc>' | head -3
```

## 로컬에서 직접 올리고 싶을 때

```bash
pnpm build
pnpm exec wrangler pages deploy dist --project-name=<프로젝트명>
```
