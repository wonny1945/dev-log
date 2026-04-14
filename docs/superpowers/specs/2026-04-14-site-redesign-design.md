# Site Redesign Design Spec
**Date:** 2026-04-14  
**Status:** Approved

## Goal

방문자가 원준일(Wonny)이라는 사람에게 흥미를 갖고, 한 일과 블로그 글을 읽고 싶게 만드는 심플하고 깔끔한 개인 포트폴리오 사이트.

---

## 1. 네비게이션 / 헤더

- 상단 고정(sticky) 헤더. 좌측: 사이트명("Wonny"). 우측: 메뉴 링크 + KO/EN 토글 + 다크모드 토글
- 메뉴 항목: About, Projects, Blog (Medium 외부 링크)
- **투명 헤더 → 스크롤 시 배경색 전환**: 페이지 최상단에서는 배경 투명, 스크롤하면 `bg-background/95 backdrop-blur` 적용
- 현재 사이드바 nav 제거. 전체 레이아웃을 단일 컬럼(최대 폭 `max-w-3xl` 내외)으로 변경
- 이모지/아이콘 사용 안 함. 텍스트 타이포그래피만 사용

---

## 2. About 페이지 (Resume 통합, `/`)

기존 `/` (About) + `/resume` 을 하나의 페이지로 통합. `/resume` 라우트는 제거.

### 섹션 순서 (스크롤 흐름)

#### 2-1. Hero
```
PRAGMATIC DEVELOPER · CLOUD FULL STACK · DX/AX  ← 작은 캡션 (대문자)
원준일 (Wonny Won)                                ← 큰 이름
발전소 현장 6년 + DX팀 5년 —
현장 문제를 직접 코드로 풀어온 엔지니어입니다.
기획부터 배포까지 혼자 끌고 갑니다.

[GitHub] [LinkedIn] [ZDNet 인터뷰] [PDF 저장]
```
- 배경 없음. 타이포그래피만.
- ZDNet 인터뷰 링크: https://zdnet.co.kr/view/?no=20251111113533

#### 2-2. What I do
3개 항목 (아이콘 없음):
1. **Cloud Full Stack 개발** — AWS 기반 서버리스 아키텍처, CI/CD, 프론트엔드부터 인프라까지
2. **DX/AX 전환 리딩** — 현장 Pain Point 발굴 → PoC → 도입까지 End-to-End PM
3. **데이터 파이프라인 & MLOps** — 발전소 운영 데이터 ETL, 이상감지, 실시간 모니터링

#### 2-3. Selected Work (티저)
Projects 페이지 연결. 3개 카드 (제목 + 성과 한 줄):
- 사내 기술자료 시스템 / 사용자 활용도 800% ↑
- Bottom Ash 분석 자동화 / 운영비 44% 절감
- 한전 조기경보 Siren-X / 24건/연 조기감지

우측 상단: "Projects 전체 보기 →" 링크

#### 2-4. Writing
Medium 블로그 글 수동 큐레이션. 제목 + "Medium →" 링크 형태.  
(초기 콘텐츠는 플레이스홀더로 시작, 추후 수동 업데이트)

#### 2-5. Career
타임라인 (왼쪽 보더라인):
- GS EPS · DX솔루션팀 매니저 / 2020.07 – 현재 / Cloud Full Stack, MLOps, DX 솔루션 발굴
- GS EPS · 바이오운전팀 / 2014.01 – 2020.07 / CFBC 바이오매스 발전소 운영

#### 2-6. Education & Certifications (최소화, 한 줄)
```
KAIST 소프트웨어 대학원 석사 · 고려사이버대 AI&Data 학사 · 항공폴리텍 항공전자
SQLD · 에너지관리기사 · 산업안전기사
```

### KO/EN 콘텐츠
About 페이지 내 모든 텍스트에 `$lang` 스토어 적용.  
기존 language store (`src/lib/stores/language.ts`) 그대로 사용.

### PDF 저장
`window.print()` 버튼 유지. 인쇄 시 헤더/nav 숨김 처리 유지.

---

## 3. Projects 페이지 (`/projects`)

### 레이아웃
이미지 제거. 리스트형(카드 그리드 → 세로 리스트).

### 필터 탭
`전체 / 개발 / DX·AX / 사이드 / 발표` — pill 형태, 선택된 항목은 `bg-foreground text-background`

### 프로젝트 항목 구조
```
[프로젝트 제목]  [개발] [발표]             2023
한 줄~두 줄 설명. 핵심 성과 포함.

역할: Full Stack · PM   Next.js   AWS CDK   FastAPI       800% ↑
```
- 뱃지: `개발 / DX·AX / 사이드 / 발표` — 단색(흑백), `border` + `text-foreground` 스타일
- 역할 태그: `bg-muted` 회색 배경
- 기술 태그: `border` 테두리만
- 성과 숫자: 오른쪽 끝, `font-bold`
- 클릭 시 기존 Drawer로 상세 내용 표시 (기존 동작 유지)

### 프로젝트 목록 (초기)

| 제목 | 유형 | 연도 | 역할 | 성과 |
|------|------|------|------|------|
| 사내 기술자료 시스템 Cloud 개발 | 개발, 발표 | 2023 | Full Stack · PM | 800% ↑ |
| 한전 조기경보시스템 Siren-X 도입 | DX·AX, 발표 | 2023 | PM · 기술검증 | 24건/연 |
| Bottom Ash 입도 분석 자동화 | 개발, 발표 | 2022 | PM · Data Engineer | 44% 절감 |
| 주요 뉴스 선정 업무 개선 | 개발 | 2021 | Full Stack | 100~500건/일 자동화 |
| LNG 발전소 최대 출력 예측 | 개발 | 2020 | Full Stack · ML | 사내 정식 프로젝트 승격 |
| RPA 반복 행정 업무 개선 | 개발 | 2021 | Full Stack | 80% 시간 단축 |
| 배출물질 센서 건전성 AI | 개발 | 2022 | Data Engineer | 연 2-4회 조기감지 |
| 발전소 보드 로그시트 전산화 | 개발 | 2021 | Full Stack | 수기→디지털 |
| Bottom Ash MV 솔루션 (SDT) | DX·AX | 2022 | PM | 837h/연 절감 |
| Mac 한글 인코딩 변환 | 사이드 | 2023 | 기획·개발 | — |
| 포켓몬 카드 랜덤 뽑기 | 사이드 | 2023 | 기획·개발 | — |

### KO/EN
프로젝트 제목/설명도 `$lang` 스토어 적용. Markdown 파일 frontmatter에 `title_ko`, `title_en` 등 이미 있는 구조 활용.

---

## 4. 기술 구현 사항

### 투명 헤더 scroll 처리
`+layout.svelte`에서 `scrollY` 바인딩:
```svelte
<script>
  let scrollY = 0;
  $: headerClass = scrollY > 10 ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent';
</script>
<svelte:window bind:scrollY />
<header class="fixed top-0 w-full z-50 transition-all {headerClass}">
```

### 레이아웃 변경
현재: `md:grid-cols-[180px_1fr]` 사이드바 레이아웃  
변경: 사이드바 제거, `max-w-3xl mx-auto` 단일 컬럼

### Nav 메뉴 업데이트
기존 메뉴에서 `이력서/Resume` 항목 제거. 최종: `About / Projects / Blog`.

### Resume 라우트
`/resume` 라우트 및 `src/routes/resume/` 디렉토리 제거.  
About 페이지에 PDF 저장 버튼 통합.

### /Work 라우트
`src/routes/Work/` 제거. `/work` 접근 시 `/projects`로 리다이렉트 (`+page.svelte`에 `goto` 사용 또는 정적 리다이렉트).

### About 페이지 콘텐츠 저장 방식
What I do, Career, Education, Writing 목록은 `+page.svelte` 내부 인라인 데이터로 관리.  
KO/EN 텍스트는 각 항목에 `ko`/`en` 프로퍼티를 가진 배열로 정의.  
Selected Work 티저 3개는 하드코딩 (Projects MD 파일과 별개).

### Projects 필터 타입 추가
현재 `FilterType = 'all' | 'work' | 'side'`  
변경: `'all' | '개발' | 'dx-ax' | '사이드' | '발표'`  
Markdown frontmatter에 `type` 필드 추가 (기존 `category` 필드 활용 또는 대체)

---

## 5. 범위 외 (이번 리디자인에 포함 안 함)

- Medium API 자동 연동 (수동 큐레이션으로 대체)
- 애니메이션/트랜지션 (헤더 투명→불투명 전환 외)
- 댓글/연락 폼
- `/Work` 라우트 (기존 유지 또는 `/projects`로 리다이렉트)
