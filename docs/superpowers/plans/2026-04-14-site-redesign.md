# Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** About과 Resume 통합, 투명 헤더, Projects 리스트 스타일, 단일 컬럼 레이아웃으로 사이트를 심플하게 리디자인한다.

**Architecture:** 5개의 독립 스토리로 나눠 각각 브랜치→PR→머지 사이클로 진행. 모든 스토리는 `main` 최신화 후 시작. 스토리 순서대로 진행해야 한다 (이후 스토리가 이전 타입 변경에 의존).

**Tech Stack:** SvelteKit (static adapter), TailwindCSS, shadcn-svelte, Vitest, TypeScript, Markdown frontmatter

---

## 파일 맵

| 파일 | 변경 | 스토리 |
|------|------|--------|
| `src/lib/parseMarkdown.ts` | `type` → `category`, `tags`/`achievement` 추가 | 1 |
| `src/routes/projects/utils.ts` | FilterType 교체, filterProjects 수정 | 1 |
| `src/routes/projects/projects.test.ts` | 테스트 픽스처·케이스 업데이트 | 1 |
| `src/lib/mdfiles/*.md` (6개) | frontmatter 업데이트 | 1 |
| `src/lib/mdfiles/` (5개 신규) | 누락 프로젝트 MD 생성 | 1 |
| `src/routes/+layout.svelte` | scrollY, 투명 헤더, 사이드바 제거, nav 업데이트 | 2 |
| `src/routes/+page.svelte` | About 페이지 전체 재작성 | 3 |
| `src/routes/+page.ts` | load 함수 단순화 | 3 |
| `src/routes/projects/+page.svelte` | 리스트 스타일 재작성 | 4 |
| `src/routes/resume/+page.svelte` | 삭제 | 5 |
| `src/routes/resume/+page.ts` | 삭제 | 5 |

---

## Story 1: feat/data-model — Project 데이터 모델 업데이트

### 목표
`type: "work"|"side"` → `category: string` + `tags` (다중 뱃지) + `achievement` (성과 숫자)

---

### Task 1-0: 브랜치 생성

- [ ] **Step 1: main 최신화 후 브랜치 생성**

```bash
git checkout main && git pull origin main
git checkout -b feat/data-model
```

---

### Task 1-1: parseMarkdown.ts 인터페이스 업데이트

**Files:**
- Modify: `src/lib/parseMarkdown.ts`

- [ ] **Step 1: 파일 읽기 후 인터페이스 수정**

`src/lib/parseMarkdown.ts` 전체를 아래로 교체:

```typescript
import { marked } from "marked";

export interface ProjectMetadata {
  title_ko: string;
  title_en: string;
  category: string;        // '개발' | 'dx-ax' | '사이드'
  tags: string;            // comma-separated: '개발, 발표'
  duration: string;
  overview_ko: string;
  overview_en: string;
  role_ko: string;
  role_en: string;
  tech: string;
  achievement: string;     // e.g. '800% ↑', '44% 절감'
  thumbnail: string;
  screenshots: string[];
}

export interface Project extends ProjectMetadata {
  techList: string[];
  tagList: string[];       // parsed from tags
  content: string;
}

export function parseMarkdown(markdown: string): {
  metadata: ProjectMetadata;
  content: string;
} {
  const metadata: Partial<ProjectMetadata> = {};
  const lines = markdown.split("\n");
  let content = "";
  let inFrontmatter = false;
  let frontmatterDone = false;
  let dashCount = 0;

  for (const line of lines) {
    if (line.trim() === "---" && dashCount < 2) {
      dashCount++;
      inFrontmatter = dashCount === 1;
      if (dashCount === 2) {
        inFrontmatter = false;
        frontmatterDone = true;
      }
      continue;
    }
    if (inFrontmatter) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (!key || !value) continue;
      if (key === "screenshots") {
        (metadata as Record<string, unknown>)[key] = JSON.parse(value);
      } else {
        (metadata as Record<string, unknown>)[key] = value;
      }
    } else if (frontmatterDone) {
      content += line + "\n";
    }
  }

  return { metadata: metadata as ProjectMetadata, content };
}

export function markdownToHtml(markdown: string): string {
  return marked(markdown) as string;
}
```

- [ ] **Step 2: 로더에서 tagList 파싱 추가**

`src/routes/+page.ts` 수정:

```typescript
import { parseMarkdown, markdownToHtml } from "$lib/parseMarkdown";
import type { Project } from "$lib/parseMarkdown";
import { sortByDuration } from "./projects/utils";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async () => {
  const files = import.meta.glob("$lib/mdfiles/*.md", {
    as: "raw",
    eager: false,
  });
  const projects: Project[] = [];

  for (const path in files) {
    const raw = (await files[path]()) as string;
    const { metadata, content } = parseMarkdown(raw);
    projects.push({
      ...metadata,
      techList: metadata.tech.split(",").map((t) => t.trim()),
      tagList: metadata.tags
        ? metadata.tags.split(",").map((t) => t.trim())
        : [],
      content: markdownToHtml(content),
    });
  }

  return { recentProjects: sortByDuration(projects).slice(0, 3) };
};
```

`src/routes/projects/+page.ts` 수정 (동일한 tagList 파싱 추가):

```typescript
import { parseMarkdown, markdownToHtml } from "$lib/parseMarkdown";
import type { Project } from "$lib/parseMarkdown";
import { sortByDuration } from "./utils";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async () => {
  const files = import.meta.glob("$lib/mdfiles/*.md", {
    as: "raw",
    eager: false,
  });
  const projects: Project[] = [];

  for (const path in files) {
    const raw = (await files[path]()) as string;
    const { metadata, content } = parseMarkdown(raw);
    projects.push({
      ...metadata,
      techList: metadata.tech.split(",").map((t) => t.trim()),
      tagList: metadata.tags
        ? metadata.tags.split(",").map((t) => t.trim())
        : [],
      content: markdownToHtml(content),
    });
  }

  return { projects: sortByDuration(projects) };
};
```

- [ ] **Step 3: 타입 체크**

```bash
npm run check
```

Expected: 에러 발생 (utils.ts, projects.test.ts 등에서 `type` 필드 참조). 다음 Task에서 수정.

---

### Task 1-2: utils.ts FilterType 업데이트

**Files:**
- Modify: `src/routes/projects/utils.ts`

- [ ] **Step 1: 실패하는 테스트 먼저 작성**

`src/routes/projects/projects.test.ts`의 `filterProjects` describe 블록을 아래로 교체:

```typescript
import { sortByDuration, filterProjects } from "./utils";
import type { Project } from "$lib/parseMarkdown";

const makeProject = (
  duration: string,
  category: string,
  tags: string,
): Project => ({
  title_ko: "테스트",
  title_en: "Test",
  category,
  tags,
  duration,
  overview_ko: "",
  overview_en: "",
  role_ko: "",
  role_en: "",
  tech: "",
  achievement: "",
  thumbnail: "",
  screenshots: [],
  techList: [],
  tagList: tags.split(",").map((t) => t.trim()),
  content: "",
});

describe("sortByDuration", () => {
  it("종료일 기준 내림차순 정렬", () => {
    const projects = [
      makeProject("2021.03 ~ 2021.06", "개발", "개발"),
      makeProject("2024.06 ~", "개발", "개발"),
      makeProject("2022.01 ~ 2022.03", "개발", "개발"),
    ];
    const sorted = sortByDuration(projects);
    expect(sorted[0].duration).toBe("2024.06 ~");
    expect(sorted[1].duration).toBe("2022.01 ~ 2022.03");
    expect(sorted[2].duration).toBe("2021.03 ~ 2021.06");
  });
});

describe("filterProjects", () => {
  const projects = [
    makeProject("2022.01 ~ 2022.03", "개발", "개발, 발표"),
    makeProject("2023.01 ~", "사이드", "사이드"),
    makeProject("2023.06 ~", "dx-ax", "dx-ax, 발표"),
  ];

  it("all: 전체 반환", () => {
    expect(filterProjects(projects, "all")).toHaveLength(3);
  });

  it("개발: category 개발만 반환", () => {
    const result = filterProjects(projects, "개발");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("개발");
  });

  it("사이드: category 사이드만 반환", () => {
    const result = filterProjects(projects, "사이드");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("사이드");
  });

  it("dx-ax: category dx-ax만 반환", () => {
    const result = filterProjects(projects, "dx-ax");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("dx-ax");
  });

  it("발표: tagList에 발표 포함된 항목만 반환", () => {
    const result = filterProjects(projects, "발표");
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm test
```

Expected: FAIL (FilterType에 새 값 없음, `type` 필드 없음 등)

- [ ] **Step 3: utils.ts 업데이트**

`src/routes/projects/utils.ts` 전체 교체:

```typescript
import type { Project } from "$lib/parseMarkdown";

export type FilterType = "all" | "개발" | "dx-ax" | "사이드" | "발표";

function getEndDate(duration: string): string {
  if (duration.includes("~")) {
    const end = duration.split("~")[1].trim();
    return end === "" ? "9999.99" : end;
  }
  return duration;
}

export function sortByDuration(projects: Project[]): Project[] {
  return [...projects].sort((a, b) =>
    getEndDate(b.duration).localeCompare(getEndDate(a.duration)),
  );
}

export function filterProjects(
  projects: Project[],
  filter: FilterType,
): Project[] {
  if (filter === "all") return projects;
  return projects.filter((p) => p.tagList.includes(filter));
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm test
```

Expected: PASS (5 tests)

- [ ] **Step 5: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음 (MD 파일 업데이트 전까지 런타임 에러는 있을 수 있으나 타입은 통과)

---

### Task 1-3: 기존 MD 파일 frontmatter 업데이트 (6개)

**Files:**
- Modify: `src/lib/mdfiles/DOCUMENTPROJECT.md`
- Modify: `src/lib/mdfiles/BIOMASSPROJECT.md`
- Modify: `src/lib/mdfiles/KEYNEWSPROJECT.md`
- Modify: `src/lib/mdfiles/MAXPOWEPROJECT.md`
- Modify: `src/lib/mdfiles/RPAPROJECT.md`
- Modify: `src/lib/mdfiles/INSPECTION.md`

- [ ] **Step 1: DOCUMENTPROJECT.md 업데이트**

```markdown
---
title_ko: 사내 기술자료 시스템 Cloud 기반 개발
title_en: In-house Technical Document System Cloud Rebuild
category: 개발
tags: 개발, 발표
duration: 2024.06 ~
overview_ko: 디자인 씽킹 기반 사용자 인터뷰부터 AWS CDK 마이크로서비스 구축까지 E2E 주도. 사용자 활용도 800% 증가.
overview_en: Led E2E from design thinking user interviews to AWS CDK microservices. User adoption increased 800%.
role_ko: Full Stack · PM
role_en: Full Stack · PM
tech: Next.js, AWS CDK, FastAPI, DynamoDB, Lambda, S3, CloudFront
achievement: 800% ↑
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 2: BIOMASSPROJECT.md 업데이트**

```markdown
---
title_ko: 발전소 Bottom Ash 입도 분석 업무 자동화
title_en: Power Plant Bottom Ash Analysis Automation
category: 개발
tags: 개발, 발표
duration: 2023.06 ~
overview_ko: Airflow 파이프라인 + Streamlit 대시보드. 하루 2회 수작업 → 1초 단위 실시간 분석. 약품 사용 44% 절감.
overview_en: Airflow pipeline + Streamlit dashboard. Manual 2x/day → real-time 1s interval analysis. 44% chemical cost reduction.
role_ko: PM · Data Engineer
role_en: PM · Data Engineer
tech: Airflow, Streamlit, AWS CDK, Lambda, S3, Python
achievement: 44% 절감
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 3: KEYNEWSPROJECT.md 업데이트**

```markdown
---
title_ko: 주요 뉴스 선정 업무 자동화
title_en: Key News Selection Automation
category: 개발
tags: 개발
duration: 2021.01 ~ 2022.01
overview_ko: BERT NLP 기반 뉴스 감성 분석 및 추천. 일 100~500개 수작업 선별을 자동화 시스템으로 전환.
overview_en: BERT NLP-based news sentiment analysis and recommendation. Automated manual 100~500 articles/day selection.
role_ko: Full Stack · ML Engineer
role_en: Full Stack · ML Engineer
tech: BERT, Django DRF, Vue.js, Python
achievement: 100~500건/일 자동화
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 4: MAXPOWEPROJECT.md 업데이트**

```markdown
---
title_ko: LNG 발전소 최대 출력 예측 리서치
title_en: LNG Power Plant Maximum Output Prediction
category: 개발
tags: 개발
duration: 2020.01 ~ 2021.01
overview_ko: XGBoost 기반 발전소 최대 출력 예측 AI 모델. Vue.js 시각화 웹앱. 사내 정식 프로젝트 승격.
overview_en: XGBoost-based power plant maximum output prediction AI model with Vue.js visualization. Promoted to official project.
role_ko: Full Stack · ML Engineer
role_en: Full Stack · ML Engineer
tech: XGBoost, Django, Vue.js, Python, Pandas
achievement: 사내 프로젝트 승격
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 5: RPAPROJECT.md 업데이트**

```markdown
---
title_ko: RPA를 통한 반복 행정 업무 자동화
title_en: Repetitive Admin Task Automation via RPA
category: 개발
tags: 개발
duration: 2021.06 ~ 2022.01
overview_ko: Python Selenium RPA + Vue SPA. 월 100회 반복 대금 지급 업무 자동화. 처리 시간 80% 단축.
overview_en: Python Selenium RPA + Vue SPA. Automated monthly 100x payment processing tasks. 80% time reduction.
role_ko: Full Stack
role_en: Full Stack
tech: Python, Selenium, Vue.js, Vuetify, Django DRF
achievement: 80% 시간 단축
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 6: INSPECTION.md 업데이트**

```markdown
---
title_ko: 배출물질 관리 및 센서 건전성 AI 모니터링
title_en: Emissions Management and Sensor Health AI Monitoring
category: 개발
tags: 개발
duration: 2022.01 ~ 2022.12
overview_ko: XGBoost 이상감지 모델 + Streamlit 대시보드. 분산된 배출물질 데이터 통합. 연 2-4회 조기 감지.
overview_en: XGBoost anomaly detection + Streamlit dashboard. Integrated dispersed emissions data. 2-4 early detections/year.
role_ko: Data Engineer
role_en: Data Engineer
tech: XGBoost, Streamlit, Python, Pandas
achievement: 연 2-4회 조기감지
thumbnail: ""
screenshots: []
---
```

---

### Task 1-4: 누락 프로젝트 MD 파일 5개 생성

**Files:**
- Create: `src/lib/mdfiles/SIRENX.md`
- Create: `src/lib/mdfiles/LOGSHEET.md`
- Create: `src/lib/mdfiles/MVPROJECT.md`
- Create: `src/lib/mdfiles/MAKENCODE.md`
- Create: `src/lib/mdfiles/POKEMON.md`

- [ ] **Step 1: SIRENX.md 생성**

```markdown
---
title_ko: 한전 조기경보시스템 Siren-X 도입
title_en: KEPCO Siren-X Early Warning System Adoption
category: dx-ax
tags: dx-ax, 발표
duration: 2023.01 ~ 2023.12
overview_ko: AI 기반 설비 이상감지 도입 기획·기술 검증·현업 교육 PM. NDA 체결 후 무상 실증 → 운영 정착.
overview_en: PM for AI-based equipment anomaly detection system. Signed NDA, conducted free pilot, achieved stable operation.
role_ko: PM · 기술검증
role_en: PM · Technical Verification
tech: DataPARC, AI 이상감지, Python
achievement: 24건/연 조기감지
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 2: LOGSHEET.md 생성**

```markdown
---
title_ko: 발전소 보드 로그시트 전산화
title_en: Power Plant Board Log Sheet Digitization
category: 개발
tags: 개발
duration: 2021.01 ~ 2021.06
overview_ko: 매시간 수기 기록하던 설비 운전 데이터를 태블릿 기반 디지털 입력으로 전환. 보고서 자동 생성.
overview_en: Converted hourly manual equipment log sheets to tablet-based digital input. Automated report generation.
role_ko: Full Stack
role_en: Full Stack
tech: Vue.js, Django DRF, 반응형 웹
achievement: 수기→디지털
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 3: MVPROJECT.md 생성**

```markdown
---
title_ko: 발전소 Bottom Ash MV 솔루션 도입 (SDT)
title_en: Power Plant Bottom Ash MV Solution Adoption (SDT)
category: dx-ax
tags: dx-ax
duration: 2022.01 ~ 2023.06
overview_ko: 머신비전 카메라 + LIBS 실시간 성분 분석 시스템 기획·검증·PM. 연간 837시간 M/H 절감.
overview_en: Machine vision camera + LIBS real-time component analysis system planning, verification, PM. 837 hours/year M/H savings.
role_ko: PM · 기술검증
role_en: PM · Technical Verification
tech: 머신비전, LIBS, MLOps
achievement: 837h/연 절감
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 4: MAKENCODE.md 생성**

```markdown
---
title_ko: Mac 한글 인코딩 윈도우 전환 사이트
title_en: Mac Korean Encoding to Windows Converter
category: 사이드
tags: 사이드
duration: 2023.01 ~ 2023.03
overview_ko: Mac에서 윈도우로 파일 이동 시 한글 파일명 깨짐 문제를 해결하는 웹 도구. 개인 불편을 직접 해결.
overview_en: Web tool to fix Korean filename corruption when moving files from Mac to Windows. Built to solve personal pain.
role_ko: 기획·개발
role_en: Planning & Development
tech: SvelteKit
achievement: ""
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 5: POKEMON.md 생성**

```markdown
---
title_ko: 포켓몬 카드 랜덤 뽑기
title_en: Pokemon Card Random Draw
category: 사이드
tags: 사이드
duration: 2023.06 ~ 2023.09
overview_ko: 인터랙티브 반응 애니메이션이 있는 포켓몬 카드 랜덤 뽑기 웹앱.
overview_en: Pokemon card random draw web app with interactive reaction animations.
role_ko: 기획·개발
role_en: Planning & Development
tech: SvelteKit, TypeScript
achievement: ""
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 6: 타입 체크 및 빌드 확인**

```bash
npm run check
npm run dev
```

브라우저에서 `/projects` 접속 → 11개 프로젝트 표시 확인.

- [ ] **Step 7: 커밋**

```bash
git add src/lib/parseMarkdown.ts src/routes/projects/utils.ts src/routes/projects/projects.test.ts src/routes/+page.ts src/routes/projects/+page.ts src/lib/mdfiles/
git commit -m "feat: update project data model — category/tags/achievement fields"
```

- [ ] **Step 8: PR 생성 및 머지**

```bash
gh pr create --title "feat: update project data model" --body "$(cat <<'EOF'
## Summary
- parseMarkdown.ts: type → category, tags, achievement 필드 추가
- FilterType: all/work/side → all/개발/dx-ax/사이드/발표
- filterProjects: tagList 기반 다중 필터
- 기존 6개 MD 파일 frontmatter 업데이트
- 누락 프로젝트 5개 MD 파일 신규 생성

## Test plan
- [ ] `npm test` — 8개 테스트 통과
- [ ] `npm run check` — 타입 에러 없음
EOF
)"
```

머지 후:
```bash
git checkout main && git pull origin main
```

---

## Story 2: feat/layout-header — 투명 헤더 + 사이드바 제거

### 목표
- 투명 헤더 → 스크롤 시 `bg-background/95 backdrop-blur-sm` 전환
- 사이드바 nav 제거, 단일 컬럼 레이아웃
- nav 메뉴에서 `이력서/Resume` 제거
- 로봇 SVG + "I'm hop" 제거

---

### Task 2-0: 브랜치 생성

- [ ] **Step 1**

```bash
git checkout -b feat/layout-header
```

---

### Task 2-1: +layout.svelte 재작성

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: +layout.svelte 전체 교체**

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import '../app.css';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';
  import { toggleMode } from 'mode-watcher';
  import { Button } from '$lib/components/ui/button/index.js';
  import { lang, toggleLang } from '$lib/stores/language';

  const menus = [
    { name: 'About', nameEn: 'About', path: `${base}/`, external: false },
    { name: '프로젝트', nameEn: 'Projects', path: `${base}/projects`, external: false },
    { name: 'Blog', nameEn: 'Blog', path: 'https://medium.com/@wonny1945', external: true }
  ];

  let scrollY = 0;
  $: scrolled = scrollY > 10;

  $: currentPath = browser ? $page.url.pathname : '';
</script>

<svelte:window bind:scrollY />

<div class="flex min-h-screen w-full flex-col">
  <header
    class="sticky top-0 z-50 flex h-16 items-center justify-between px-4 transition-all duration-200 md:px-8
      {scrolled ? 'border-b bg-background/95 backdrop-blur-sm' : 'bg-transparent'}"
  >
    <a href="{base}/" class="text-lg font-bold tracking-tight">Wonny</a>
    <nav class="flex items-center gap-6 text-sm">
      {#each menus as menu}
        <a
          href={menu.path}
          target={menu.external ? '_blank' : undefined}
          rel={menu.external ? 'noopener noreferrer' : undefined}
          class="transition-colors hover:text-foreground
            {currentPath === menu.path.replace(base, '') || (menu.path === `${base}/` && currentPath === '/')
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground'}"
        >
          {$lang === 'ko' ? menu.name : menu.nameEn}
        </a>
      {/each}
    </nav>
    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" on:click={toggleLang} class="text-xs font-semibold">
        {$lang === 'ko' ? 'EN' : 'KO'}
      </Button>
      <Button on:click={toggleMode} variant="outline" size="icon">
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-3xl px-4 py-10">
    <slot></slot>
  </main>
</div>
```

- [ ] **Step 2: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 브라우저 시각 검증**

```bash
npm run dev
```

확인 항목:
- 페이지 최상단: 헤더 배경 투명
- 스크롤 후: 헤더 배경 흰색/다크모드 배경 + 하단 보더
- 좌측 사이드바 없음
- nav 메뉴에 About, Projects, Blog만 있음
- 이력서 메뉴 없음

- [ ] **Step 4: 커밋**

```bash
git add src/routes/+layout.svelte
git commit -m "feat: transparent sticky header with scroll transition, remove sidebar nav"
```

- [ ] **Step 5: PR 생성 및 머지**

```bash
gh pr create --title "feat: layout — transparent header + single column" --body "$(cat <<'EOF'
## Summary
- 투명 헤더: scrollY > 10 시 bg-background/95 + backdrop-blur 전환
- 사이드바 제거, max-w-3xl 단일 컬럼
- nav 메뉴: About / Projects / Blog (이력서 제거)
- 로봇 SVG, "I'm hop" 제거

## Test plan
- [ ] `npm run check` 통과
- [ ] 브라우저 스크롤 시 헤더 전환 확인
- [ ] 다크모드에서도 동작 확인
EOF
)"
```

```bash
git checkout main && git pull origin main
```

---

## Story 3: feat/about-page — About 페이지 재작성 (Resume 통합)

### 목표
기존 About + Resume 통합. Hero → What I do → Selected Work → Writing → Career → Education 흐름.

---

### Task 3-0: 브랜치 생성

- [ ] **Step 1**

```bash
git checkout -b feat/about-page
```

---

### Task 3-1: +page.ts 단순화

**Files:**
- Modify: `src/routes/+page.ts`

- [ ] **Step 1: +page.ts를 prerender만 export하도록 단순화**

```typescript
export const prerender = true;
```

---

### Task 3-2: +page.svelte 재작성

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: +page.svelte 전체 교체**

```svelte
<script lang="ts">
  import { lang } from '$lib/stores/language';
  import { base } from '$app/paths';
  import { Separator } from '$lib/components/ui/separator';
  import { Button } from '$lib/components/ui/button';
  import { Printer } from 'lucide-svelte';

  function printPage() {
    if (typeof window !== 'undefined') window.print();
  }

  const whatIDo = [
    {
      ko: {
        title: 'Cloud Full Stack 개발',
        desc: 'AWS 기반 서버리스 아키텍처, CI/CD, 프론트엔드부터 인프라까지'
      },
      en: {
        title: 'Cloud Full Stack Development',
        desc: 'AWS serverless architecture, CI/CD, from frontend to infrastructure'
      }
    },
    {
      ko: {
        title: 'DX/AX 전환 리딩',
        desc: '현장 Pain Point 발굴 → PoC → 도입까지 End-to-End PM'
      },
      en: {
        title: 'DX/AX Transformation Lead',
        desc: 'Field Pain Point discovery → PoC → adoption, End-to-End PM'
      }
    },
    {
      ko: {
        title: '데이터 파이프라인 & MLOps',
        desc: '발전소 운영 데이터 ETL, 이상감지, 실시간 모니터링'
      },
      en: {
        title: 'Data Pipeline & MLOps',
        desc: 'Power plant operational data ETL, anomaly detection, real-time monitoring'
      }
    }
  ];

  const selectedWork = [
    {
      ko: { title: '사내 기술자료 시스템', achievement: '사용자 활용도 800% ↑' },
      en: { title: 'Technical Document System', achievement: 'User adoption +800%' }
    },
    {
      ko: { title: 'Bottom Ash 분석 자동화', achievement: '운영비 44% 절감' },
      en: { title: 'Bottom Ash Analysis Automation', achievement: '44% cost reduction' }
    },
    {
      ko: { title: '조기경보 Siren-X 도입', achievement: '24건/연 조기감지' },
      en: { title: 'Early Warning Siren-X', achievement: '24 cases/year early detection' }
    }
  ];

  // NOTE: url 값을 실제 Medium 시리즈/포스트 URL로 교체할 것.
  // 시리즈 URL 형식 예: https://medium.com/@wonny1945/list/<series-name>
  // 현재는 프로필 링크로 임시 설정.
  const writing = [
    {
      ko: 'AWS CDK로 서버리스 구축한 이야기',
      en: 'How I Built a Serverless System with AWS CDK',
      url: 'https://medium.com/@wonny1945'
    },
    {
      ko: '발전소 데이터를 실시간으로 분석하기까지',
      en: 'Building Real-time Power Plant Data Analytics',
      url: 'https://medium.com/@wonny1945'
    }
  ];

  const career = [
    {
      ko: {
        company: 'GS EPS · DX솔루션팀 매니저',
        desc: 'Cloud Full Stack 개발, MLOps, DX 솔루션 발굴'
      },
      en: {
        company: 'GS EPS · DX Solution Team Manager',
        desc: 'Cloud Full Stack Development, MLOps, DX Solution Discovery'
      },
      period: '2020.07 – 현재'
    },
    {
      ko: {
        company: 'GS EPS · 바이오운전팀',
        desc: 'CFBC 바이오매스 발전소 현장 운영 및 관리'
      },
      en: {
        company: 'GS EPS · Bio-Operations Team',
        desc: 'CFBC Biomass Power Plant operations and management'
      },
      period: '2014.01 – 2020.07'
    }
  ];

  const education = {
    ko: 'KAIST 소프트웨어 대학원 석사 · 고려사이버대 AI&Data 학사 · 항공폴리텍 항공전자',
    en: 'KAIST Graduate School of Software (M.S.) · Korea Cyber Univ. AI & Data (B.S.) · KAAT Aviation Electronics'
  };

  const certifications = {
    ko: 'SQLD · 에너지관리기사 · 산업안전기사',
    en: 'SQLD · Energy Management Engineer · Industrial Safety Engineer'
  };
</script>

<svelte:head>
  <style>
    @media print {
      header, .no-print { display: none !important; }
    }
  </style>
</svelte:head>

<div class="grid gap-12">

  <!-- Hero -->
  <section class="pt-4">
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {$lang === 'ko' ? 'PRAGMATIC DEVELOPER · CLOUD FULL STACK · DX/AX' : 'PRAGMATIC DEVELOPER · CLOUD FULL STACK · DX/AX'}
    </p>
    <h1 class="mb-3 text-4xl font-black tracking-tight">
      {$lang === 'ko' ? '원준일 (Wonny Won)' : 'Wonny Won (원준일)'}
    </h1>
    <p class="mb-6 max-w-xl text-base leading-relaxed text-muted-foreground">
      {#if $lang === 'ko'}
        발전소 현장 6년 + DX팀 5년 —<br />
        현장 문제를 직접 코드로 풀어온 엔지니어입니다.<br />
        기획부터 배포까지 혼자 끌고 갑니다.
      {:else}
        6 years in power plant operations + 5 years in DX team —<br />
        an engineer who solves field problems directly with code.<br />
        From planning to deployment, end-to-end.
      {/if}
    </p>
    <div class="flex flex-wrap gap-2 no-print">
      <Button variant="outline" size="sm">
        <a href="https://github.com/wonny1945" target="_blank" rel="noopener noreferrer" class="flex items-center">
          GitHub
        </a>
      </Button>
      <Button variant="outline" size="sm">
        <a href="https://linkedin.com/in/준일-원-58975525b" target="_blank" rel="noopener noreferrer" class="flex items-center">
          LinkedIn
        </a>
      </Button>
      <Button variant="outline" size="sm">
        <a href="https://zdnet.co.kr/view/?no=20251111113533" target="_blank" rel="noopener noreferrer" class="flex items-center">
          {$lang === 'ko' ? 'ZDNet 인터뷰' : 'ZDNet Interview'}
        </a>
      </Button>
      <Button variant="outline" size="sm" on:click={printPage}>
        <Printer class="mr-1.5 h-3.5 w-3.5" />
        {$lang === 'ko' ? 'PDF 저장' : 'Save PDF'}
      </Button>
    </div>
  </section>

  <Separator />

  <!-- What I do -->
  <section>
    <h2 class="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      What I Do
    </h2>
    <div class="grid gap-3">
      {#each whatIDo as item}
        <div class="rounded-lg border px-4 py-3">
          <span class="font-semibold">{$lang === 'ko' ? item.ko.title : item.en.title}</span>
          <span class="text-muted-foreground"> — {$lang === 'ko' ? item.ko.desc : item.en.desc}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Selected Work -->
  <section>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Selected Work
      </h2>
      <a href="{base}/projects" class="text-xs text-muted-foreground transition-colors hover:text-foreground">
        {$lang === 'ko' ? '전체 보기 →' : 'View all →'}
      </a>
    </div>
    <div class="grid gap-3 sm:grid-cols-3">
      {#each selectedWork as work}
        <a
          href="{base}/projects"
          class="rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <p class="font-semibold">{$lang === 'ko' ? work.ko.title : work.en.title}</p>
          <p class="mt-1 text-sm text-muted-foreground">
            {$lang === 'ko' ? work.ko.achievement : work.en.achievement}
          </p>
        </a>
      {/each}
    </div>
  </section>

  <!-- Writing -->
  <section>
    <h2 class="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      Writing
    </h2>
    <div class="divide-y">
      {#each writing as post}
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between py-3 text-sm transition-colors hover:text-foreground"
        >
          <span>{$lang === 'ko' ? post.ko : post.en}</span>
          <span class="ml-4 shrink-0 text-xs text-muted-foreground">Medium →</span>
        </a>
      {/each}
    </div>
  </section>

  <Separator />

  <!-- Career -->
  <section>
    <h2 class="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {$lang === 'ko' ? 'Career' : 'Career'}
    </h2>
    <div class="grid gap-5 border-l pl-4">
      {#each career as job}
        <div>
          <p class="font-semibold">{$lang === 'ko' ? job.ko.company : job.en.company}</p>
          <p class="text-sm text-muted-foreground">
            {job.period} · {$lang === 'ko' ? job.ko.desc : job.en.desc}
          </p>
        </div>
      {/each}
    </div>
  </section>

  <!-- Education & Certifications -->
  <section class="pb-8">
    <h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {$lang === 'ko' ? 'Education & Certifications' : 'Education & Certifications'}
    </h2>
    <p class="text-sm text-muted-foreground">
      {$lang === 'ko' ? education.ko : education.en}
    </p>
    <p class="mt-1 text-sm text-muted-foreground">
      {$lang === 'ko' ? certifications.ko : certifications.en}
    </p>
  </section>

</div>
```

- [ ] **Step 2: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 브라우저 시각 검증**

```bash
npm run dev
```

확인 항목:
- Hero: 대문자 캡션 + 큰 이름 + 소개문 + 링크 버튼 4개
- What I do: 3개 항목 (아이콘 없음, 텍스트만)
- Selected Work: 3개 카드 → 클릭 시 /projects 이동
- Writing: Medium 링크 2개
- Career: 왼쪽 보더 타임라인 2개
- Education: 한 줄 텍스트
- KO/EN 토글 시 내용 전환
- PDF 저장 버튼 → 프린트 다이얼로그

- [ ] **Step 4: 커밋**

```bash
git add src/routes/+page.svelte src/routes/+page.ts
git commit -m "feat: rewrite About page — merged resume, hero + career sections"
```

- [ ] **Step 5: PR 생성 및 머지**

```bash
gh pr create --title "feat: about page — merged resume" --body "$(cat <<'EOF'
## Summary
- About + Resume 통합 단일 페이지
- 섹션: Hero → What I do → Selected Work → Writing → Career → Education
- 인라인 KO/EN 콘텐츠
- PDF 저장 버튼 유지 (print CSS)
- +page.ts load 함수 제거

## Test plan
- [ ] `npm run check` 통과
- [ ] KO/EN 토글 동작
- [ ] PDF 저장 버튼 → 프린트 다이얼로그
- [ ] Selected Work 카드 → /projects 이동
EOF
)"
```

```bash
git checkout main && git pull origin main
```

---

## Story 4: feat/projects-list — Projects 페이지 리스트 스타일

### 목표
카드 그리드 → 세로 리스트. 뱃지(개발/DX·AX/사이드/발표) + 역할 + 기술 태그 + 성과 숫자.

---

### Task 4-0: 브랜치 생성

- [ ] **Step 1**

```bash
git checkout -b feat/projects-list
```

---

### Task 4-1: +page.svelte 재작성

**Files:**
- Modify: `src/routes/projects/+page.svelte`

- [ ] **Step 1: +page.svelte 전체 교체**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { lang } from '$lib/stores/language';
  import { filterProjects, type FilterType } from './utils';
  import { ProjectModal } from '$lib/components/ui/project-modal';
  import { Separator } from '$lib/components/ui/separator';
  import type { Project } from '$lib/parseMarkdown';

  export let data: PageData;

  let filter: FilterType = 'all';
  let selectedProject: Project | null = null;
  let modalOpen = false;

  $: filtered = filterProjects(data.projects, filter);

  function openModal(project: Project) {
    selectedProject = project;
    modalOpen = true;
  }

  const FILTER_LABELS: Record<FilterType, { ko: string; en: string }> = {
    all:    { ko: '전체',  en: 'All' },
    '개발':  { ko: '개발',  en: 'Dev' },
    'dx-ax': { ko: 'DX · AX', en: 'DX · AX' },
    '사이드': { ko: '사이드', en: 'Side' },
    '발표':  { ko: '발표',  en: 'Talk' }
  };

  const FILTER_KEYS: FilterType[] = ['all', '개발', 'dx-ax', '사이드', '발표'];

  function getYear(duration: string): string {
    return duration.slice(0, 4);
  }
</script>

<div class="grid gap-6">
  <h3 class="text-2xl font-bold tracking-tight">
    {$lang === 'ko' ? '프로젝트' : 'Projects'}
  </h3>
  <Separator class="-mt-3" />

  <!-- Filter pills -->
  <div class="flex flex-wrap gap-2">
    {#each FILTER_KEYS as key}
      <button
        class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors
          {filter === key
            ? 'bg-foreground text-background'
            : 'border text-muted-foreground hover:text-foreground'}"
        on:click={() => (filter = key)}
      >
        {$lang === 'ko' ? FILTER_LABELS[key].ko : FILTER_LABELS[key].en}
      </button>
    {/each}
  </div>

  <!-- Project list -->
  <div class="divide-y">
    {#each filtered as project (project.title_en)}
      <button
        class="w-full py-5 text-left transition-colors hover:bg-muted/30"
        on:click={() => openModal(project)}
      >
        <!-- Title row -->
        <div class="mb-2 flex items-start justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold">
              {$lang === 'ko' ? project.title_ko : project.title_en}
            </span>
            {#each project.tagList as tag}
              <span class="rounded border px-2 py-0.5 text-xs text-foreground/70">
                {tag === 'dx-ax' ? 'DX · AX' : tag}
              </span>
            {/each}
          </div>
          <span class="shrink-0 text-sm text-muted-foreground">
            {getYear(project.duration)}
          </span>
        </div>

        <!-- Overview -->
        <p class="mb-3 text-sm text-muted-foreground">
          {$lang === 'ko' ? project.overview_ko : project.overview_en}
        </p>

        <!-- Footer: role + tech + achievement -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap gap-1.5">
            <span class="rounded bg-muted px-2 py-0.5 text-xs font-medium">
              {$lang === 'ko' ? `역할: ${project.role_ko}` : `Role: ${project.role_en}`}
            </span>
            {#each project.techList.slice(0, 4) as tech}
              <span class="rounded border px-2 py-0.5 text-xs text-muted-foreground">
                {tech}
              </span>
            {/each}
          </div>
          {#if project.achievement}
            <span class="text-sm font-bold">{project.achievement}</span>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<ProjectModal project={selectedProject} bind:open={modalOpen} />
```

- [ ] **Step 2: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 3: 브라우저 시각 검증**

```bash
npm run dev
```

확인 항목:
- 필터 탭: 전체/개발/DX·AX/사이드/발표
- 프로젝트 리스트: 제목 + 뱃지 + 연도
- 한 줄 설명
- 역할 태그 + 기술 태그(최대 4개) + 성과 숫자
- 항목 클릭 → Drawer 상세 표시
- 필터 전환 동작
- KO/EN 토글

- [ ] **Step 4: 커밋**

```bash
git add src/routes/projects/+page.svelte
git commit -m "feat: projects page — list style with category badges and achievement"
```

- [ ] **Step 5: PR 생성 및 머지**

```bash
gh pr create --title "feat: projects list style" --body "$(cat <<'EOF'
## Summary
- 카드 그리드 → 세로 리스트
- 필터: 전체/개발/DX·AX/사이드/발표
- 각 항목: 제목 + 뱃지 + 연도 + 설명 + 역할 + 기술 태그 + 성과 숫자
- 이미지 제거

## Test plan
- [ ] `npm run check` 통과
- [ ] 필터 탭 동작 확인
- [ ] 클릭 → Drawer 상세 표시
- [ ] KO/EN 토글
EOF
)"
```

```bash
git checkout main && git pull origin main
```

---

## Story 5: feat/route-cleanup — /resume 라우트 제거

### 목표
`/resume` 라우트 파일 삭제. (`/Work`는 이미 `/projects` 리다이렉트 중이므로 유지.)

---

### Task 5-0: 브랜치 생성

- [ ] **Step 1**

```bash
git checkout -b feat/route-cleanup
```

---

### Task 5-1: resume 라우트 삭제

**Files:**
- Delete: `src/routes/resume/+page.svelte`
- Delete: `src/routes/resume/+page.ts`

- [ ] **Step 1: resume 파일 삭제**

```bash
rm src/routes/resume/+page.svelte
rm src/routes/resume/+page.ts
rmdir src/routes/resume
```

- [ ] **Step 2: 빌드 확인 (prerender 시 /resume 제거 검증)**

```bash
npm run build
```

Expected: 빌드 성공. `build/` 디렉토리에 `resume/` 없음.

```bash
ls build/ | grep resume
```

Expected: 출력 없음

- [ ] **Step 3: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "chore: remove /resume route — content merged into About page"
```

- [ ] **Step 5: PR 생성 및 머지**

```bash
gh pr create --title "chore: remove /resume route" --body "$(cat <<'EOF'
## Summary
- /resume 라우트 파일 삭제 (About 페이지에 통합됨)
- /Work는 /projects 리다이렉트 이미 구현됨

## Test plan
- [ ] `npm run build` 성공
- [ ] `build/resume/` 디렉토리 없음
- [ ] /resume 직접 접근 시 404
EOF
)"
```

```bash
git checkout main && git pull origin main
```

---

## 최종 검증

모든 스토리 머지 후:

```bash
npm run build && npm run preview
```

- [ ] `/` — About 페이지: Hero, What I do, Selected Work, Writing, Career, Education
- [ ] `/projects` — 리스트 스타일, 필터 동작
- [ ] `/Work` — `/projects` 리다이렉트
- [ ] `/resume` — 404 반환
- [ ] 헤더 스크롤 전환 (투명 → 배경색)
- [ ] KO/EN 전 페이지 동작
- [ ] 다크모드 전 페이지 동작
- [ ] PDF 저장 (About 페이지)
- [ ] `npm test` — 전체 테스트 통과
