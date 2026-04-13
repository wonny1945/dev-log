# Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SvelteKit 정적 블로그를 미니멀 클린 포트폴리오로 리디자인 — 속도 개선, 프로젝트 필터/모달, KO/EN 토글, Resume 페이지 추가.

**Architecture:** 현재 `/Work` 클라이언트 사이드 로딩을 `+page.ts` load() 빌드타임 프리렌더로 교체. 공유 언어 store(`lang`)로 KO/EN 전환. 마크다운 frontmatter를 이중 언어 + type 필드로 마이그레이션. Resume은 `resume.json` 단일 파일로 관리.

**Tech Stack:** SvelteKit, TailwindCSS, shadcn-svelte(bits-ui), embla-carousel-svelte, mode-watcher, Vitest, @testing-library/svelte

---

## 파일 구조 (전체)

### 신규 생성
```
src/
  lib/
    stores/
      language.ts           # KO/EN writable store + toggleLang()
    data/
      resume.json           # Resume 전체 데이터
    components/
      ui/
        project-card/
          ProjectCard.svelte # 리디자인된 카드 (type badge, thumbnail, role)
        project-modal/
          ProjectModal.svelte # Dialog + embla 이미지 슬라이더
  routes/
    projects/
      +page.ts              # load() — 빌드타임 프리렌더
      +page.svelte          # 필터 탭 + 카드 그리드
    resume/
      +page.ts              # load() — resume.json 읽기
      +page.svelte          # Resume UI + print CSS
  test/
    setup.ts                # @testing-library/jest-dom import

src/lib/stores/language.test.ts
src/lib/parseMarkdown.test.ts
src/routes/projects/projects.test.ts   # 필터 로직 유닛 테스트
```

### 수정
```
vite.config.ts              # Vitest 설정 추가
package.json                # vitest, @testing-library/svelte 추가
src/lib/parseMarkdown.ts    # WorkMetadata → ProjectMetadata 타입 업데이트
src/lib/mdfiles/*.md        # frontmatter 6개 파일 마이그레이션
src/routes/+layout.svelte   # 네비 업데이트 + KO/EN 토글
src/routes/+page.svelte     # 프로젝트 미리보기 섹션 추가
src/routes/+layout.ts       # prerender 확인 (현재 true)
```

---

## Story 1: Testing Foundation

### Task 1-1: Vitest + Testing Library 설치

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: 패키지 설치**

```bash
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
```

Expected: 패키지 설치 완료, `package.json` devDependencies 업데이트.

- [ ] **Step 2: package.json에 test 스크립트 추가**

`package.json`의 `scripts` 섹션에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: vite.config.ts 업데이트**

`vite.config.ts`를 아래로 교체:
```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	assetsInclude: ['**/*.md'],
	server: {
		fs: {
			allow: ['..']
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/test/setup.ts']
	}
});
```

- [ ] **Step 4: setup.ts 생성**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: 동작 확인**

```bash
npm run test
```

Expected: "No test files found" (테스트 파일 없음 — 정상). 에러 없이 종료.

- [ ] **Step 6: 커밋**

```bash
git add vite.config.ts package.json package-lock.json src/test/setup.ts
git commit -m "chore: add vitest + testing-library"
```

---

## Story 2: Language Store

### Task 2-1: 언어 store 생성

**Files:**
- Create: `src/lib/stores/language.ts`
- Create: `src/lib/stores/language.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/stores/language.test.ts`:
```ts
import { get } from 'svelte/store';
import { lang, toggleLang } from './language';

describe('language store', () => {
  beforeEach(() => {
    lang.set('ko');
  });

  it('기본값은 ko', () => {
    expect(get(lang)).toBe('ko');
  });

  it('toggleLang: ko → en', () => {
    toggleLang();
    expect(get(lang)).toBe('en');
  });

  it('toggleLang: en → ko', () => {
    lang.set('en');
    toggleLang();
    expect(get(lang)).toBe('ko');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './language'`

- [ ] **Step 3: store 구현**

`src/lib/stores/language.ts`:
```ts
import { writable } from 'svelte/store';

export type Lang = 'ko' | 'en';
export const lang = writable<Lang>('ko');

export function toggleLang(): void {
	lang.update((l) => (l === 'ko' ? 'en' : 'ko'));
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

Expected: PASS (3 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/stores/
git commit -m "feat: add KO/EN language store"
```

---

## Story 3: Data Layer — parseMarkdown 업데이트 + 마이그레이션

### Task 3-1: ProjectMetadata 타입 + parseMarkdown 업데이트

**Files:**
- Modify: `src/lib/parseMarkdown.ts`
- Create: `src/lib/parseMarkdown.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/parseMarkdown.test.ts`:
```ts
import { parseMarkdown, markdownToHtml } from './parseMarkdown';

const SAMPLE_MD = `---
title_ko: 테스트 프로젝트
title_en: Test Project
type: work
duration: 2022.01 ~ 2022.03
overview_ko: 테스트 개요
overview_en: Test overview
role_ko: FE 개발자
role_en: FE Developer
tech: Python, Vue, Docker
thumbnail: /images/test-thumb.png
screenshots: ["/images/test-1.png", "/images/test-2.png"]
---
본문 내용`;

describe('parseMarkdown', () => {
  it('새 frontmatter 필드를 파싱한다', () => {
    const { metadata } = parseMarkdown(SAMPLE_MD);
    expect(metadata.title_ko).toBe('테스트 프로젝트');
    expect(metadata.title_en).toBe('Test Project');
    expect(metadata.type).toBe('work');
    expect(metadata.duration).toBe('2022.01 ~ 2022.03');
    expect(metadata.overview_ko).toBe('테스트 개요');
    expect(metadata.role_ko).toBe('FE 개발자');
    expect(metadata.tech).toBe('Python, Vue, Docker');
    expect(metadata.thumbnail).toBe('/images/test-thumb.png');
  });

  it('screenshots를 배열로 파싱한다', () => {
    const { metadata } = parseMarkdown(SAMPLE_MD);
    expect(metadata.screenshots).toEqual(['/images/test-1.png', '/images/test-2.png']);
  });

  it('본문 컨텐츠를 반환한다', () => {
    const { content } = parseMarkdown(SAMPLE_MD);
    expect(content.trim()).toBe('본문 내용');
  });

  it('markdownToHtml: 마크다운을 HTML로 변환한다', () => {
    const html = markdownToHtml('**bold**');
    expect(html).toContain('<strong>bold</strong>');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test
```

Expected: FAIL — 타입 에러 또는 파싱 실패

- [ ] **Step 3: parseMarkdown.ts 업데이트**

`src/lib/parseMarkdown.ts`를 아래로 교체:
```ts
import { marked } from 'marked';

export interface ProjectMetadata {
	title_ko: string;
	title_en: string;
	type: 'work' | 'side';
	duration: string;
	overview_ko: string;
	overview_en: string;
	role_ko: string;
	role_en: string;
	tech: string;
	thumbnail: string;
	screenshots: string[];
}

export interface Project extends ProjectMetadata {
	techList: string[];
	content: string;
}

export function parseMarkdown(markdown: string): {
	metadata: ProjectMetadata;
	content: string;
} {
	const metadata: Partial<ProjectMetadata> = {};
	const lines = markdown.split('\n');
	let content = '';
	let inFrontmatter = false;
	let frontmatterDone = false;
	let dashCount = 0;

	for (const line of lines) {
		if (line.trim() === '---' && dashCount < 2) {
			dashCount++;
			inFrontmatter = dashCount === 1;
			if (dashCount === 2) {
				inFrontmatter = false;
				frontmatterDone = true;
			}
			continue;
		}
		if (inFrontmatter) {
			const colonIdx = line.indexOf(':');
			if (colonIdx === -1) continue;
			const key = line.slice(0, colonIdx).trim();
			const value = line.slice(colonIdx + 1).trim();
			if (!key || !value) continue;
			if (key === 'screenshots') {
				(metadata as Record<string, unknown>)[key] = JSON.parse(value);
			} else {
				(metadata as Record<string, unknown>)[key] = value;
			}
		} else if (frontmatterDone) {
			content += line + '\n';
		}
	}

	return { metadata: metadata as ProjectMetadata, content };
}

export function markdownToHtml(markdown: string): string {
	return marked(markdown) as string;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

Expected: PASS (4 tests)

- [ ] **Step 5: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음. (기존 `/Work` 페이지에서 `WorkMetadata` import 에러 발생시 다음 Task에서 해결)

- [ ] **Step 6: 커밋**

```bash
git add src/lib/parseMarkdown.ts src/lib/parseMarkdown.test.ts
git commit -m "feat: update parseMarkdown to ProjectMetadata with ko/en + type fields"
```

---

### Task 3-2: 기존 마크다운 파일 6개 frontmatter 마이그레이션

**Files:**
- Modify: `src/lib/mdfiles/RPAPROJECT.md`
- Modify: `src/lib/mdfiles/INSPECTION.md`
- Modify: `src/lib/mdfiles/KEYNEWSPROJECT.md`
- Modify: `src/lib/mdfiles/MAXPOWEPROJECT.md`
- Modify: `src/lib/mdfiles/BIOMASSPROJECT.md`
- Modify: `src/lib/mdfiles/DOCUMENTPROJECT.md`

> ⚠️ thumbnail/screenshots는 이미지 파일 추가 전까지 빈 값으로 둔다.
> `thumbnail: ""`, `screenshots: []`

- [ ] **Step 1: RPAPROJECT.md frontmatter 교체**

frontmatter를:
```yaml
---
title_ko: 경비 처리 자동화 웹 애플리케이션
title_en: Automated Expense Management Web Application
type: work
duration: 2022.01 ~ 2022.03
overview_ko: 반복적인 법인카드 경비 처리 업무를 Selenium RPA로 자동화하여 월 40시간 절감
overview_en: Automated corporate card expense workflows via Selenium RPA, saving 40 hrs/month
role_ko: FE 개발자 · Selenium RPA 모듈 개발
role_en: Front-end Developer · Selenium RPA Module Developer
tech: HTML/CSS, JavaScript, Python, Vue, Docker, Selenium
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 2: INSPECTION.md frontmatter 교체**

```yaml
---
title_ko: 설비 점검 프로세스 개선 프로젝트
title_en: Equipment Inspection Process Improvement Project
type: work
duration: 2022.03 ~ 2022.06
overview_ko: 발전소의 종이 기반 설비 점검 프로세스를 디지털화하여 업무 효율 향상
overview_en: Digitalized paper-based equipment inspection process in power plants
role_ko: 풀스택 개발자
role_en: Full Stack Developer
tech: JavaScript, HTML, CSS, Vue, Vuetify, Python, Django DRF, Pandas
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 3: KEYNEWSPROJECT.md frontmatter 교체**

```yaml
---
title_ko: 핵심 뉴스 개선 프로젝트
title_en: Key News Improvement Project
type: work
duration: 2022.06 ~ 2022.09
overview_ko: 코사인 유사도 기반 뉴스 추천으로 사내 핵심 뉴스 탐색 및 공유 개선
overview_en: Improved internal news discovery and sharing via cosine similarity-based recommendation
role_ko: 뉴스 추천 모듈 개발자
role_en: News Recommendation Module Developer
tech: JavaScript, HTML, CSS, Vue, Vuetify, Python, Django DRF, Pandas, gensim, nltk, konlpy
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 4: MAXPOWEPROJECT.md frontmatter 교체**

```yaml
---
title_ko: 발전소 최대 출력 예측 프로젝트
title_en: Power Plant Maximum Output Prediction Project
type: work
duration: 2021.03 ~ 2021.06
overview_ko: XGBoost 기반 AI 모델로 복합화력발전소 최대 출력을 예측하여 입찰 프로세스 개선
overview_en: Improved bidding process by predicting max output of combined cycle power plant via XGBoost
role_ko: FE 개발자 · AI 모델 개발자
role_en: Front-end Developer · AI Model Developer
tech: JavaScript, HTML, CSS, Python, Django, Pandas, XGBoost
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 5: BIOMASSPROJECT.md frontmatter 교체**

```yaml
---
title_ko: 바이오매스 발전소 클라우드 DevOps 환경 구축
title_en: Cloud-based DevOps Environment for Biomass Power Plant
type: work
duration: 2023.06 ~
overview_ko: 바이오매스 발전소 센서 데이터를 AWS 클라우드로 통합하고 DevOps/CI-CD 환경 구축
overview_en: Integrated biomass power plant sensor data into AWS Cloud with DevOps and CI/CD capabilities
role_ko: DevOps 환경 개발자 · 데이터 시각화 개발자
role_en: DevOps Environment Developer · Data Visualization Developer
tech: AWS CDK, Python, Lambda, S3, Airflow, QuickSight
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 6: DOCUMENTPROJECT.md frontmatter 교체**

```yaml
---
title_ko: 사내 기술 문서 시스템 UI/UX 개선 프로젝트
title_en: In-house Technical Document System UI/UX Improvement
type: work
duration: 2024.06 ~
overview_ko: 기존 사내 기술 문서 시스템을 AWS 클라우드 기반으로 재구축하고 검색 기능 강화
overview_en: Rebuilt internal technical document system on AWS cloud with enhanced search capabilities
role_ko: AWS CDK 기반 풀스택 개발자
role_en: AWS CDK-based Full Stack Developer
tech: AWS CDK, Lambda, DynamoDB, S3, API Gateway, CloudFront, SvelteKit
thumbnail: ""
screenshots: []
---
```

- [ ] **Step 7: 커밋**

```bash
git add src/lib/mdfiles/
git commit -m "chore: migrate md frontmatter to bilingual ProjectMetadata format"
```

---

## Story 4: Projects 페이지 — 속도 개선 + 필터 + 카드 + 모달

### Task 4-1: load() 함수로 빌드타임 프리렌더

**Files:**
- Create: `src/routes/projects/+page.ts`
- Create: `src/routes/projects/projects.test.ts`

- [ ] **Step 1: 유틸 함수 테스트 작성 (정렬 로직)**

`src/routes/projects/projects.test.ts`:
```ts
import { sortByDuration, filterProjects } from './utils';
import type { Project } from '$lib/parseMarkdown';

const makeProject = (duration: string, type: 'work' | 'side'): Project => ({
	title_ko: '테스트',
	title_en: 'Test',
	type,
	duration,
	overview_ko: '',
	overview_en: '',
	role_ko: '',
	role_en: '',
	tech: '',
	thumbnail: '',
	screenshots: [],
	techList: [],
	content: ''
});

describe('sortByDuration', () => {
	it('종료일 기준 내림차순 정렬', () => {
		const projects = [
			makeProject('2021.03 ~ 2021.06', 'work'),
			makeProject('2024.06 ~', 'work'),
			makeProject('2022.01 ~ 2022.03', 'work')
		];
		const sorted = sortByDuration(projects);
		expect(sorted[0].duration).toBe('2024.06 ~');
		expect(sorted[1].duration).toBe('2022.01 ~ 2022.03');
		expect(sorted[2].duration).toBe('2021.03 ~ 2021.06');
	});
});

describe('filterProjects', () => {
	const projects = [
		makeProject('2022.01 ~ 2022.03', 'work'),
		makeProject('2023.01 ~', 'side')
	];

	it('all: 전체 반환', () => {
		expect(filterProjects(projects, 'all')).toHaveLength(2);
	});

	it('work: work만 반환', () => {
		const result = filterProjects(projects, 'work');
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('work');
	});

	it('side: side만 반환', () => {
		const result = filterProjects(projects, 'side');
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('side');
	});
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
npm run test
```

Expected: FAIL — `Cannot find module './utils'`

- [ ] **Step 3: utils.ts 생성**

`src/routes/projects/utils.ts`:
```ts
import type { Project } from '$lib/parseMarkdown';

export type FilterType = 'all' | 'work' | 'side';

function getEndDate(duration: string): string {
	if (duration.includes('~')) {
		const end = duration.split('~')[1].trim();
		return end === '' ? '9999.99' : end; // 진행 중 → 가장 최신으로
	}
	return duration;
}

export function sortByDuration(projects: Project[]): Project[] {
	return [...projects].sort((a, b) =>
		getEndDate(b.duration).localeCompare(getEndDate(a.duration))
	);
}

export function filterProjects(projects: Project[], filter: FilterType): Project[] {
	if (filter === 'all') return projects;
	return projects.filter((p) => p.type === filter);
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npm run test
```

Expected: PASS (5 tests)

- [ ] **Step 5: +page.ts 생성**

`src/routes/projects/+page.ts`:
```ts
import { parseMarkdown, markdownToHtml } from '$lib/parseMarkdown';
import type { Project } from '$lib/parseMarkdown';
import { sortByDuration } from './utils';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = async () => {
	const files = import.meta.glob('$lib/mdfiles/*.md', { as: 'raw', eager: false });
	const projects: Project[] = [];

	for (const path in files) {
		const raw = (await files[path]()) as string;
		const { metadata, content } = parseMarkdown(raw);
		projects.push({
			...metadata,
			techList: metadata.tech.split(',').map((t) => t.trim()),
			content: markdownToHtml(content)
		});
	}

	return { projects: sortByDuration(projects) };
};
```

- [ ] **Step 6: 커밋**

```bash
git add src/routes/projects/
git commit -m "feat: add projects load() with build-time prerender + sort/filter utils"
```

---

### Task 4-2: ProjectCard 컴포넌트

**Files:**
- Create: `src/lib/components/ui/project-card/ProjectCard.svelte`
- Create: `src/lib/components/ui/project-card/index.ts`

- [ ] **Step 1: ProjectCard.svelte 생성**

`src/lib/components/ui/project-card/ProjectCard.svelte`:
```svelte
<script lang="ts">
	import { lang } from '$lib/stores/language';
	import type { Project } from '$lib/parseMarkdown';

	export let project: Project;
	export let onclick: () => void = () => {};
</script>

<button
	class="group w-full rounded-xl border border-border bg-card text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
	on:click={onclick}
>
	<!-- Type badge + Duration -->
	<div class="flex items-center justify-between px-4 pt-4">
		<span
			class="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide
			{project.type === 'work'
				? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
				: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}"
		>
			{project.type}
		</span>
		<span class="text-xs text-muted-foreground">{project.duration}</span>
	</div>

	<!-- Thumbnail -->
	<div class="mx-4 mt-3 aspect-video overflow-hidden rounded-lg bg-muted">
		{#if project.thumbnail}
			<img
				src={project.thumbnail}
				alt={$lang === 'ko' ? project.title_ko : project.title_en}
				class="h-full w-full object-cover"
			/>
		{:else}
			<div class="flex h-full items-center justify-center text-xs text-muted-foreground">
				No image
			</div>
		{/if}
	</div>

	<!-- Content -->
	<div class="p-4">
		<h3 class="font-semibold leading-snug text-foreground">
			{$lang === 'ko' ? project.title_ko : project.title_en}
		</h3>
		<p class="mt-1 text-sm text-muted-foreground line-clamp-2">
			{$lang === 'ko' ? project.overview_ko : project.overview_en}
		</p>

		<!-- Role -->
		<p class="mt-2 text-sm text-foreground/70">
			<span class="mr-1 text-muted-foreground">✦</span>
			{$lang === 'ko' ? project.role_ko : project.role_en}
		</p>

		<!-- Tech badges -->
		<div class="mt-3 flex flex-wrap gap-1.5">
			{#each project.techList as tech}
				<span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
					{tech}
				</span>
			{/each}
		</div>
	</div>
</button>
```

`src/lib/components/ui/project-card/index.ts`:
```ts
export { default as ProjectCard } from './ProjectCard.svelte';
```

- [ ] **Step 2: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/lib/components/ui/project-card/
git commit -m "feat: add redesigned ProjectCard component"
```

---

### Task 4-3: ProjectModal 컴포넌트

**Files:**
- Create: `src/lib/components/ui/project-modal/ProjectModal.svelte`
- Create: `src/lib/components/ui/project-modal/index.ts`

- [ ] **Step 1: ProjectModal.svelte 생성**

`src/lib/components/ui/project-modal/ProjectModal.svelte`:
```svelte
<script lang="ts">
	import { lang } from '$lib/stores/language';
	import type { Project } from '$lib/parseMarkdown';
	import * as Dialog from '$lib/components/ui/dialog';
	import EmblaCarousel from 'embla-carousel-svelte';

	export let project: Project | null = null;
	export let open = false;

	let emblaApi: ReturnType<typeof EmblaCarousel> | undefined;
	let currentIndex = 0;

	function onInit(event: CustomEvent) {
		emblaApi = event.detail;
		emblaApi.on('select', () => {
			currentIndex = emblaApi!.selectedScrollSnap();
		});
	}

	function prev() { emblaApi?.scrollPrev(); }
	function next() { emblaApi?.scrollNext(); }
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-2xl">
		{#if project}
			<Dialog.Header>
				<div class="flex items-center gap-2">
					<span
						class="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide
						{project.type === 'work'
							? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
							: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}"
					>
						{project.type}
					</span>
					<span class="text-xs text-muted-foreground">{project.duration}</span>
				</div>
				<Dialog.Title class="mt-1 text-xl">
					{$lang === 'ko' ? project.title_ko : project.title_en}
				</Dialog.Title>
			</Dialog.Header>

			<!-- Image slider -->
			{#if project.screenshots.length > 0}
				<div class="relative mt-2 overflow-hidden rounded-lg bg-muted">
					<div use:EmblaCarousel={{ loop: false }} on:emblaInit={onInit}>
						<div class="flex">
							{#each project.screenshots as src}
								<div class="min-w-0 flex-[0_0_100%]">
									<img {src} alt="screenshot" class="h-64 w-full object-cover" />
								</div>
							{/each}
						</div>
					</div>
					{#if project.screenshots.length > 1}
						<button
							class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow hover:bg-background"
							on:click={prev}
						>‹</button>
						<button
							class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 shadow hover:bg-background"
							on:click={next}
						>›</button>
						<span class="absolute bottom-2 right-3 text-xs text-white/80">
							{currentIndex + 1} / {project.screenshots.length}
						</span>
					{/if}
				</div>
			{/if}

			<!-- Details -->
			<div class="mt-4 space-y-4">
				<div>
					<p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
					<p class="mt-1 text-sm text-foreground">
						{$lang === 'ko' ? project.overview_ko : project.overview_en}
					</p>
				</div>
				<div>
					<p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">My Role</p>
					<p class="mt-1 text-sm text-foreground">
						{$lang === 'ko' ? project.role_ko : project.role_en}
					</p>
				</div>
				<div>
					<p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tech Stack</p>
					<div class="mt-1.5 flex flex-wrap gap-1.5">
						{#each project.techList as tech}
							<span class="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tech}</span>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
```

`src/lib/components/ui/project-modal/index.ts`:
```ts
export { default as ProjectModal } from './ProjectModal.svelte';
```

- [ ] **Step 2: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/lib/components/ui/project-modal/
git commit -m "feat: add ProjectModal with embla image slider"
```

---

### Task 4-4: Projects 페이지 UI (`/projects`)

**Files:**
- Create: `src/routes/projects/+page.svelte`

- [ ] **Step 1: +page.svelte 생성**

`src/routes/projects/+page.svelte`:
```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { lang } from '$lib/stores/language';
	import { filterProjects, type FilterType } from './utils';
	import { ProjectCard } from '$lib/components/ui/project-card';
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
		all: { ko: '전체', en: 'All' },
		work: { ko: '회사', en: 'Work' },
		side: { ko: '사이드', en: 'Side' }
	};
</script>

<div class="grid gap-6">
	<h3 class="text-3xl font-bold tracking-tight">
		{$lang === 'ko' ? '프로젝트' : 'Projects'}
	</h3>
	<Separator class="-mt-3" />

	<!-- Filter tabs -->
	<div class="flex gap-2">
		{#each Object.entries(FILTER_LABELS) as [key, label]}
			<button
				class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors
				{filter === key
					? 'bg-foreground text-background'
					: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
				on:click={() => (filter = key as FilterType)}
			>
				{$lang === 'ko' ? label.ko : label.en}
			</button>
		{/each}
	</div>

	<!-- Card grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#each filtered as project (project.title_en)}
			<ProjectCard {project} onclick={() => openModal(project)} />
		{/each}
	</div>
</div>

<ProjectModal project={selectedProject} bind:open={modalOpen} />
```

- [ ] **Step 2: 기존 /Work 라우트 제거 및 리다이렉트**

`src/routes/Work/+page.svelte`를 아래로 교체 (리다이렉트):
```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(() => {
		goto(`${base}/projects`, { replaceState: true });
	});
</script>
```

- [ ] **Step 3: dev 서버에서 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173/projects` 열어 확인:
- 카드 그리드 즉시 렌더 (로딩 없음)
- 필터 탭 동작
- 카드 클릭 시 모달 오픈

- [ ] **Step 4: 커밋**

```bash
git add src/routes/projects/+page.svelte src/routes/Work/+page.svelte
git commit -m "feat: projects page with filter tabs + modal"
```

---

## Story 5: Layout — 네비게이션 + KO/EN 토글

### Task 5-1: 레이아웃 업데이트

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: +layout.svelte 업데이트**

`src/routes/+layout.svelte`의 `<script>` 블록에 추가:
```svelte
<script lang="ts">
	// 기존 import 유지 ...
	import { lang, toggleLang } from '$lib/stores/language';
	// 기존 menus 배열을 아래로 교체:
	const menus = [
		{ name: 'About', nameEn: 'About', path: `${base}/`, external: false },
		{ name: '프로젝트', nameEn: 'Projects', path: `${base}/projects`, external: false },
		{ name: '이력서', nameEn: 'Resume', path: `${base}/resume`, external: false },
		{ name: 'Blog', nameEn: 'Blog', path: 'https://medium.com/@wonny1945', external: true }
	];
</script>
```

헤더에 KO/EN 토글 버튼 추가 (다크모드 버튼 옆):
```svelte
<!-- KO/EN 토글 -->
<Button variant="outline" size="sm" on:click={toggleLang} class="text-xs font-semibold">
	{$lang === 'ko' ? 'EN' : 'KO'}
</Button>
```

사이드 네비 링크 업데이트:
```svelte
{#each menus as menu}
	<a
		href={menu.path}
		target={menu.external ? '_blank' : undefined}
		rel={menu.external ? 'noopener noreferrer' : undefined}
		class="transition-colors hover:text-foreground
			{url === menu.path.replace(base, '') || (menu.path === `${base}/` && url === '/')
				? 'font-semibold text-primary'
				: 'text-muted-foreground'}"
	>
		{$lang === 'ko' ? menu.name : menu.nameEn}
	</a>
{/each}
```

- [ ] **Step 2: 확인**

```bash
npm run dev
```

- KO/EN 버튼 클릭 시 네비 텍스트 전환
- Projects / Resume 링크 동작

- [ ] **Step 3: 커밋**

```bash
git add src/routes/+layout.svelte
git commit -m "feat: update nav with Projects/Resume + KO/EN toggle"
```

---

## Story 6: About 페이지 — 프로젝트 미리보기 섹션

### Task 6-1: About 페이지에 load() + 프로젝트 미리보기 추가

**Files:**
- Create: `src/routes/+page.ts`
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: +page.ts 생성**

`src/routes/+page.ts`:
```ts
import { parseMarkdown, markdownToHtml } from '$lib/parseMarkdown';
import type { Project } from '$lib/parseMarkdown';
import { sortByDuration } from './projects/utils';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = async () => {
	const files = import.meta.glob('$lib/mdfiles/*.md', { as: 'raw', eager: false });
	const projects: Project[] = [];

	for (const path in files) {
		const raw = (await files[path]()) as string;
		const { metadata, content } = parseMarkdown(raw);
		projects.push({
			...metadata,
			techList: metadata.tech.split(',').map((t) => t.trim()),
			content: markdownToHtml(content)
		});
	}

	return { recentProjects: sortByDuration(projects).slice(0, 3) };
};
```

- [ ] **Step 2: +page.svelte 하단에 프로젝트 미리보기 섹션 추가**

`src/routes/+page.svelte`의 `<script>` 블록에 추가:
```svelte
<script lang="ts">
	// 기존 import 유지 ...
	import { ProjectCard } from '$lib/components/ui/project-card';
	import { ProjectModal } from '$lib/components/ui/project-modal';
	import { lang } from '$lib/stores/language';
	import type { PageData } from './$types';
	import type { Project } from '$lib/parseMarkdown';

	export let data: PageData;

	let selectedProject: Project | null = null;
	let modalOpen = false;

	function openModal(project: Project) {
		selectedProject = project;
		modalOpen = true;
	}
</script>
```

기존 마지막 `</div>` 앞에 섹션 추가:
```svelte
<!-- 최근 프로젝트 미리보기 -->
<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title class="text-2xl">
				{$lang === 'ko' ? '최근 프로젝트' : 'Recent Projects'}
			</Card.Title>
			<a
				href="{base}/projects"
				class="text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				{$lang === 'ko' ? '전체 보기 →' : 'View all →'}
			</a>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.recentProjects as project (project.title_en)}
				<ProjectCard {project} onclick={() => openModal(project)} />
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<ProjectModal project={selectedProject} bind:open={modalOpen} />
```

- [ ] **Step 3: 확인**

```bash
npm run dev
```

About 페이지 하단에 최근 3개 프로젝트 카드 + "전체 보기 →" 확인.

- [ ] **Step 4: 빌드 테스트**

```bash
npm run build
```

Expected: 빌드 성공, 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/routes/+page.ts src/routes/+page.svelte
git commit -m "feat: add recent projects preview section to About page"
```

---

## Story 7: Resume 페이지

### Task 7-1: resume.json 생성 (Claude 인터뷰 기반)

> ⚠️ 이 Task는 Claude와 인터뷰를 통해 내용을 채운다. 아래 구조에 실제 데이터를 채워 넣을 것.

**Files:**
- Create: `src/lib/data/resume.json`

- [ ] **Step 1: 빈 resume.json 구조 생성**

`src/lib/data/resume.json`:
```json
{
  "name_ko": "원준일",
  "name_en": "Wonjunil",
  "title_ko": "데이터 엔지니어 · 소프트웨어 개발자",
  "title_en": "Data Engineer · Software Developer",
  "contact": {
    "email": "wonny1945@gmail.com",
    "github": "https://github.com/wonny1945",
    "linkedin": "https://www.linkedin.com/in/%EC%A4%80%EC%9D%BC-%EC%9B%90-58975525b/"
  },
  "experience": [
    {
      "company_ko": "회사명",
      "company_en": "Company Name",
      "team_ko": "디지털 트랜스포메이션팀",
      "team_en": "Digital Transformation Team",
      "period": "2020.01 ~ present",
      "roles": [
        {
          "title_ko": "데이터 엔지니어",
          "title_en": "Data Engineer",
          "period": "2020.01 ~ present",
          "highlights_ko": ["주요 성과 1", "주요 성과 2"],
          "highlights_en": ["Achievement 1", "Achievement 2"]
        }
      ]
    }
  ],
  "skills": {
    "Frontend": ["JavaScript", "SvelteKit", "Vue", "TailwindCSS"],
    "Backend": ["Python", "Django", "FastAPI"],
    "DevOps": ["AWS CDK", "Lambda", "S3", "Airflow"],
    "Data": ["Pandas", "XGBoost", "QuickSight"]
  },
  "education": [
    {
      "school_ko": "학교명",
      "school_en": "University Name",
      "major_ko": "전공",
      "major_en": "Major",
      "period": "2008 ~ 2015"
    }
  ]
}
```

- [ ] **Step 2: Claude 인터뷰로 실제 내용 채우기**

아래 항목을 Claude에게 순서대로 알려주면 Claude가 resume.json을 업데이트:
- 회사명 / 팀 / 재직 기간
- 각 역할별 주요 성과 (수치 포함)
- 학력

- [ ] **Step 3: 커밋**

```bash
git add src/lib/data/resume.json
git commit -m "feat: add resume.json data"
```

---

### Task 7-2: Resume 페이지 UI

**Files:**
- Create: `src/routes/resume/+page.ts`
- Create: `src/routes/resume/+page.svelte`

- [ ] **Step 1: +page.ts 생성**

`src/routes/resume/+page.ts`:
```ts
import type { PageLoad } from './$types';
import resumeData from '$lib/data/resume.json';

export const prerender = true;

export const load: PageLoad = () => {
	return { resume: resumeData };
};
```

- [ ] **Step 2: +page.svelte 생성**

`src/routes/resume/+page.svelte`:
```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { lang } from '$lib/stores/language';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Printer } from 'lucide-svelte';

	export let data: PageData;
	$: r = data.resume;

	function printResume() {
		window.print();
	}
</script>

<svelte:head>
	<style>
		@media print {
			header, nav, .no-print { display: none !important; }
			main { padding: 0 !important; }
			.print-break { page-break-before: always; }
		}
	</style>
</svelte:head>

<div class="grid gap-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">
				{$lang === 'ko' ? r.name_ko : r.name_en}
			</h2>
			<p class="mt-1 text-lg text-muted-foreground">
				{$lang === 'ko' ? r.title_ko : r.title_en}
			</p>
			<div class="mt-2 flex gap-4 text-sm text-muted-foreground">
				<a href="mailto:{r.contact.email}" class="hover:text-foreground">{r.contact.email}</a>
				<a href={r.contact.github} target="_blank" rel="noopener" class="hover:text-foreground">GitHub</a>
				<a href={r.contact.linkedin} target="_blank" rel="noopener" class="hover:text-foreground">LinkedIn</a>
			</div>
		</div>
		<Button variant="outline" on:click={printResume} class="no-print gap-2">
			<Printer class="h-4 w-4" />
			{$lang === 'ko' ? 'PDF 저장' : 'Save PDF'}
		</Button>
	</div>

	<Separator />

	<!-- Experience -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{$lang === 'ko' ? '경력' : 'Experience'}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			{#each r.experience as exp}
				<div>
					<div class="flex items-baseline justify-between">
						<h4 class="font-semibold">
							{$lang === 'ko' ? exp.company_ko : exp.company_en}
						</h4>
						<span class="text-sm text-muted-foreground">{exp.period}</span>
					</div>
					<p class="text-sm text-muted-foreground">
						{$lang === 'ko' ? exp.team_ko : exp.team_en}
					</p>
					{#each exp.roles as role}
						<div class="mt-3 pl-4 border-l-2 border-border">
							<div class="flex items-baseline justify-between">
								<span class="text-sm font-medium">
									{$lang === 'ko' ? role.title_ko : role.title_en}
								</span>
								<span class="text-xs text-muted-foreground">{role.period}</span>
							</div>
							<ul class="mt-1 space-y-1">
								{#each ($lang === 'ko' ? role.highlights_ko : role.highlights_en) as h}
									<li class="text-sm text-muted-foreground before:mr-2 before:content-['·']">{h}</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Skills -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{$lang === 'ko' ? '기술 스택' : 'Skills'}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#each Object.entries(r.skills) as [category, techs]}
				<div class="flex gap-3">
					<span class="w-24 shrink-0 text-sm font-medium text-muted-foreground">{category}</span>
					<div class="flex flex-wrap gap-1.5">
						{#each techs as tech}
							<span class="rounded-md bg-muted px-2 py-0.5 text-xs">{tech}</span>
						{/each}
					</div>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Education -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{$lang === 'ko' ? '학력' : 'Education'}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-2">
			{#each r.education as edu}
				<div class="flex items-baseline justify-between">
					<div>
						<span class="font-medium">
							{$lang === 'ko' ? edu.school_ko : edu.school_en}
						</span>
						<span class="ml-2 text-sm text-muted-foreground">
							{$lang === 'ko' ? edu.major_ko : edu.major_en}
						</span>
					</div>
					<span class="text-sm text-muted-foreground">{edu.period}</span>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>
</div>
```

- [ ] **Step 3: 확인**

```bash
npm run dev
```

`http://localhost:5173/resume` 에서:
- KO/EN 토글 동작
- "PDF 저장" 버튼 클릭 시 브라우저 인쇄 다이얼로그 열림

- [ ] **Step 4: 빌드 + 타입 체크**

```bash
npm run check && npm run build
```

Expected: 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/routes/resume/ src/lib/data/resume.json
git commit -m "feat: add /resume page with print support"
```

---

## Story 8: 마무리 + 린트

### Task 8-1: 최종 검증

- [ ] **Step 1: 전체 테스트**

```bash
npm run test
```

Expected: 모든 테스트 PASS.

- [ ] **Step 2: 타입 체크**

```bash
npm run check
```

Expected: 에러 없음.

- [ ] **Step 3: 린트**

```bash
npm run lint
```

Expected: 에러 없음.

- [ ] **Step 4: 프로덕션 빌드**

```bash
npm run build && npm run preview
```

`http://localhost:4173` 에서 전체 동작 확인:
- `/` About — 최근 프로젝트 미리보기 즉시 렌더
- `/projects` — 필터 탭, 카드 클릭 → 모달
- `/resume` — KO/EN 전환, PDF 버튼
- 다크모드 토글

- [ ] **Step 5: 최종 커밋**

```bash
git add -A
git commit -m "chore: lint + final build verification"
```
