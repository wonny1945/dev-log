# Dev-Log 블로그 리디자인 설계 문서

**날짜:** 2026-04-13  
**작성:** Claude Code (brainstorming session)

---

## 1. 목표

- Work 페이지 초기 로딩 속도 개선 (현재: 클라이언트 사이드 동적 로딩 → 목표: 빌드타임 프리렌더)
- 더 인터렉티브하고 직관적인 자기소개 페이지
- 회사 Work + 사이드 프로젝트를 한 곳에서 관리 및 표시
- 한국어/영어 손쉬운 전환
- Resume 페이지 추가 + Claude 인터뷰 기반 업데이트 워크플로우

---

## 2. 페이지 구조

### 기존 → 변경

| 기존 | 변경 | 비고 |
|------|------|------|
| `/` About | `/` About (개선) | 프로젝트 미리보기 섹션 추가 |
| `/Work` | `/projects` | 리네임 + 기능 강화 |
| 없음 | `/resume` | 신규 |

### 네비게이션

헤더: `Wonny dev-log` | About · Projects · Resume · Blog(외부) | `KO/EN` 토글 | 다크모드 토글

---

## 3. About 페이지 (`/`)

### 섹션 구성 (위에서 아래로)

1. **인트로 카드** — 이름, 한 줄 소개, GitHub/LinkedIn/Mail 링크
2. **Skills 카드** — 기술 스택 뱃지 그리드 (현재 구조 유지, 시각적 개선)
3. **Work Experience 카드** — 경력 타임라인 (현재 구조 유지)
4. **최근 프로젝트 미리보기** — `duration` 종료일 기준 최신 3개 카드 + "전체 보기 →" 버튼 (`/projects` 링크)

### 프로젝트 미리보기 카드

`/projects`와 동일한 카드 컴포넌트 재사용. `load()`로 데이터 로드.

---

## 4. Projects 페이지 (`/projects`)

### 필터 탭

`전체 | Work | Side` — 클릭 시 카드 그리드 필터링 (클라이언트 사이드 reactive)

### 프로젝트 카드 (그리드)

```
[ WORK 배지 ]              [ 2022.01 ~ 2022.03 ]
[ 썸네일 이미지 (16:9) ]
[ 제목 ]
[ 한 줄 설명 (overview) ]
[ ✦ 역할 ]
[ Python ] [ Vue ] [ Docker ]  ← 기술스택 뱃지
```

### 모달 (카드 클릭 시)

```
[ WORK 배지 ]  제목              [ ✕ ]
[ 기간 ]
[ 이미지 슬라이더  ←  1/3  → ]
Overview:  한 줄 설명
My Role:   역할
Tech Stack: [ Python ] [ Vue ] [ Docker ]
```

모달은 기존 `bits-ui` Dialog 컴포넌트 활용. 이미지 슬라이더는 기존 `embla-carousel-svelte` 활용.

### 속도 개선

- **기존:** `+page.svelte`의 `onMount`에서 `import.meta.glob` 클라이언트 실행
- **변경:** `+page.ts`의 `load()` 함수에서 `import.meta.glob` 실행 → SvelteKit 빌드타임 프리렌더 → HTML에 데이터 포함되어 즉시 렌더

---

## 5. Resume 페이지 (`/resume`)

### 섹션 구성

1. **헤더** — 이름, 직함, 연락처
2. **Work Experience** — 경력 타임라인 (회사, 기간, 역할, 주요 성과)
3. **Skills** — 카테고리별 기술 스택
4. **Education** — 학력
5. **PDF 다운로드 버튼** — `window.print()` + print-specific CSS로 인쇄 최적화 (별도 PDF 파일 관리 불필요)

### 데이터 소스

`src/lib/data/resume.json` 파일 하나로 관리.

```json
{
  "name_ko": "원준일",
  "name_en": "Wonjunil",
  "title_ko": "데이터 엔지니어 · 소프트웨어 개발자",
  "title_en": "Data Engineer · Software Developer",
  "experience": [...],
  "skills": {...},
  "education": [...]
}
```

### Claude 인터뷰 워크플로우

새 경험/성과가 생겼을 때:
1. 사용자가 Claude에게 간략히 상황 설명
2. Claude가 인터뷰 질문으로 내용 구체화 (기간, 역할, 사용 기술, 성과 수치 등)
3. Claude가 `resume.json` 업데이트
4. 사이트 자동 반영 (빌드 후 배포)

---

## 6. 언어 전환 (KO/EN)

### 구현 방식

`src/lib/stores/language.ts`에 Svelte writable store:

```ts
import { writable } from 'svelte/store';
export const lang = writable<'ko' | 'en'>('ko');
```

헤더에 `KO | EN` 토글 버튼. 외부 i18n 라이브러리 없이 store 직접 활용.

### 마크다운 frontmatter 구조 (Projects)

```yaml
---
title_ko: RPA 자동화 프로젝트
title_en: RPA Automation Project
type: work          # work | side
duration: 2022.01 ~ 2022.03
overview_ko: 반복 업무 자동화를 통한 경비 처리 효율화
overview_en: Automated repetitive expense workflows via RPA
role_ko: FE 개발자 · Selenium RPA 모듈 개발
role_en: FE Developer · Selenium RPA Module
tech: Python, Vue, Docker, Selenium
thumbnail: /images/rpa-thumb.png
screenshots: ["/images/rpa-1.png", "/images/rpa-2.png"]
---
본문 (상세 설명)
```

### 기존 마크다운 파일 마이그레이션

기존 6개 파일(`src/lib/mdfiles/*.md`) frontmatter를 새 구조로 변환. `parseMarkdown.ts`의 `WorkMetadata` 타입 업데이트.

---

## 7. 스타일

- **방향:** 미니멀 클린 (현재 스타일의 개선, 방향 유지)
- **다크모드:** 기존 `mode-watcher` 그대로 활용
- **타이포:** 현재 system-ui 유지
- **포인트 컬러:** 현재 사용 중인 indigo/blue 계열 유지
- **카드 hover:** 살짝 올라오는 shadow 트랜지션

---

## 8. 범위 외 (이번 작업에서 제외)

- 댓글, 좋아요 등 소셜 기능
- 검색 기능
- CMS 도입
- `/blog` 페이지 신규 제작 (Medium 외부 링크 유지)
