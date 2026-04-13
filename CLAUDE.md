# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (requires BASE_PATH env var)
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
npm run check:watch  # Type-check in watch mode
npm run lint         # Check formatting and lint
npm run format       # Auto-format with Prettier
```

No test suite is configured yet — add Vitest + @testing-library/svelte when implementing features (see Development Philosophy below).

## Architecture

This is a **SvelteKit static site** (personal portfolio/dev-log) deployed to GitHub Pages via `@sveltejs/adapter-static`.

### Routing

- `/` — About page (`src/routes/+page.svelte`): bio, skills, work experience
- `/Work` — Project showcase (`src/routes/Work/+page.svelte`): dynamically loads project cards

The layout (`src/routes/+layout.svelte`) handles the sidebar nav, dark mode toggle (`mode-watcher`), and active link tracking using `$page` store and `popstate` events.

### Project Content (Markdown-driven)

Work projects live as Markdown files in `src/lib/mdfiles/`. Each file uses a custom frontmatter block (not standard YAML — parsed manually by `src/lib/parseMarkdown.ts`):

```
---
title: Project Name
Project Duration: 2022.01 ~ 2022.03
Project Overview: Short description
Applied Technologies: HTML/CSS,JS,Python
Key Roles: Front-end Developer
screenshots: ["img1.png", "img2.png"]
---
Body content in Markdown...
```

`parseMarkdown.ts` exports `parseMarkdown()` (returns `{ metadata, content }`) and `markdownToHtml()` (wraps `marked`). The Work page loads all `*.md` files via `import.meta.glob` at runtime on the client.

### UI Components

Shadcn-svelte components (built on `bits-ui`) live in `src/lib/components/ui/`. The custom `ProjectCard` component at `src/lib/components/ui/project-card/` wraps project metadata + a Drawer for detail view.

### Deployment / Base Path

`svelte.config.js` sets `paths.base` from `process.env.BASE_PATH` in production (empty string in dev). Use `{base}/` prefix for all internal links (already done in layout). The static adapter outputs to `build/` with `fallback: '404.html'`.

### Dark Mode

Handled by `mode-watcher`. Toggle button is in the layout header. SVG icons in the layout use `dark:stroke-white` / `dark:fill-white` Tailwind variants for dark mode adaptation.

---

## Development Philosophy

### UI
- **Base:** shadcn-svelte (bits-ui) + TailwindCSS — use existing components first, customize via Tailwind classes and CSS variables rather than replacing.
- All UI must support dark mode via Tailwind `dark:` variants.

### Git Workflow (per story)

Every story follows this exact lifecycle — no exceptions:

```bash
# 1. 스토리 시작 전: main 최신화 후 브랜치 생성
git checkout main && git pull origin main
git checkout -b feat/<story-name>   # e.g. feat/language-store

# 2. 스토리 구현 (TDD 사이클, 잦은 커밋)

# 3. 스토리 완료 후: PR 생성
gh pr create --title "feat: <story-name>" --body "..."

# 4. 사용자 리뷰 후 머지
gh pr merge <PR번호> --squash

# 5. 다음 스토리 시작 전 main으로 복귀 후 반복
git checkout main && git pull origin main
```

브랜치 네이밍: `feat/`, `fix/`, `chore/` 접두사 + kebab-case 스토리명.

### Workflow
- **Agile stories:** Each feature is broken into small, independently reviewable user stories. Implement and review one story at a time — never batch multiple stories into a single session.
- **Superpowers:** Use `/brainstorm` before new features, `superpowers:test-driven-development` before writing implementation code, `superpowers:verification-before-completion` before marking any story done.
- **TDD:** Write the test first, then the implementation. Use Vitest + @testing-library/svelte for component/unit tests.
- **Review cadence:** After each story is implemented, show the result in the browser and create a PR before moving to the next story.