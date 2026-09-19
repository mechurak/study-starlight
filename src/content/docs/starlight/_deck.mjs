export default {
  "navOrder": 1300,
  "catalogOrder": 2000,
  "label": "Starlight",
  "title": "Starlight",
  "icon": "star",
  "aliases": [
    "Astro Starlight"
  ],
  "description": "왜 이 도구를 골랐고 어떻게 쓰는지 — 이 사이트 자체가 예제다.",
  "category": "tools",
  "tags": [
    "frontend"
  ],
  "termIntro": "required",
  "sidebar": [
    {
      "label": "시작",
      "pages": [
        "intro",
        "first-deck",
        "landscape"
      ]
    },
    {
      "label": "기반",
      "pages": [
        "astro",
        "structure"
      ]
    },
    {
      "label": "콘텐츠",
      "pages": [
        "mdx",
        "components",
        "custom"
      ]
    },
    {
      "label": "글쓰기와 운영",
      "pages": [
        "writing",
        "pipeline"
      ]
    },
    {
      "label": "배포",
      "pages": [
        "github-pages",
        "vercel",
        "cloudflare-pages"
      ]
    },
    {
      "label": "마무리",
      "pages": [
        "wrapup"
      ]
    }
  ],
  "map": [
    {
      "label": "시작",
      "href": "/starlight/intro/",
      "title": "시작",
      "tone": "mute",
      "desc": "범위와 3층 멘탈 모델 · 문서 도구 지형과 Starlight를 고른 이유",
      "note": "왜 노션이 아니라 문서 사이트이고, 왜 그중 Starlight인가",
      "items": [
        [
          "실행 준비",
          "/starlight/intro/"
        ],
        [
          "첫 덱 만들기",
          "/starlight/first-deck/"
        ]
      ]
    },
    {
      "label": "기반",
      "href": "/starlight/astro/",
      "title": "기반",
      "tone": "key",
      "desc": "Astro의 정적 출력·브라우저 JS · Starlight 라우팅과 topics",
      "note": "파일 하나가 페이지가 되기까지 밑에서 무슨 일이 일어나나"
    },
    {
      "label": "콘텐츠",
      "href": "/starlight/mdx/",
      "title": "콘텐츠",
      "tone": "ok",
      "desc": "MDX의 문법과 함정 · 내장 컴포넌트의 역할 분담 · 커스텀 컴포넌트와 override",
      "note": "본문에 무엇을 어떻게 쓰고, 어디서 조용히 깨지나"
    },
    {
      "label": "작성·검증",
      "href": "/starlight/writing/",
      "title": "글쓰기와 운영",
      "tone": "warn",
      "desc": "독자·예제·의미 리뷰 · 콘텐츠·빌드·링크 검사와 검색",
      "note": "빌드가 못 잡는 것은 무엇으로 판정하나"
    },
    {
      "label": "배포",
      "href": "/starlight/github-pages/",
      "title": "배포",
      "tone": "key",
      "desc": "GitHub Pages · Vercel · Cloudflare Pages — 호스팅마다 직접 정할 값과 저장소가 대신 처리하는 것",
      "note": "같은 dist/를 올리는데 왜 호스팅마다 손댈 곳이 다른가",
      "items": [
        [
          "GitHub Pages",
          "/starlight/github-pages/"
        ],
        [
          "Vercel",
          "/starlight/vercel/"
        ],
        [
          "Cloudflare Pages",
          "/starlight/cloudflare-pages/"
        ]
      ]
    },
    {
      "label": "참조",
      "href": "/starlight/wrapup/",
      "title": "마무리",
      "tone": "mute",
      "desc": "학습 지식베이스 설계 체크리스트 · 새 덱 추가 절차 · 명령 치트시트",
      "note": "비슷한 사이트를 시작할 때 무엇부터 하고, 언제 구조를 늘리나"
    }
  ]
};
