<script lang="ts">
  import { lang } from '$lib/stores/language';
  import { base } from '$app/paths';
  import { Button } from '$lib/components/ui/button';

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
        title: '데이터 파이프라인 & DevOps',
        desc: '발전소 운영 데이터 ETL, 이상감지, 실시간 모니터링'
      },
      en: {
        title: 'Data Pipeline & DevOps',
        desc: 'Power plant operational data ETL, anomaly detection, real-time monitoring'
      }
    }
  ];

  const selectedWork = [
    {
      ko: { title: '사내 기술자료 시스템', achievement: '사용자 10배 ↑' },
      en: { title: 'Technical Document System', achievement: 'Users 10× growth' }
    },
    {
      ko: { title: 'Bottom Ash 분석 자동화', achievement: '약품 33% 절감' },
      en: { title: 'Bottom Ash Analysis Automation', achievement: '33% chemical cost reduction' }
    },
    {
      ko: { title: '조기경보 Siren-X 정착', achievement: '15건 사고방지' },
      en: { title: 'Early Warning Siren-X', achievement: '15 incidents prevented' }
    }
  ];

  const writing = [
    {
      ko: 'About DX',
      en: 'About DX',
      url: 'https://medium.com/@wonny1945/list/about-dx-895ec7e808dd'
    },
    {
      ko: 'About Industry',
      en: 'About Industry',
      url: 'https://medium.com/@wonny1945/list/about-industry-2614f8e8a1d4'
    }
  ];

  const career = [
    {
      ko: {
        company: 'GS EPS · DX솔루션팀 매니저',
        desc: 'Cloud Full Stack 개발, DevOps, DX 솔루션 발굴'
      },
      en: {
        company: 'GS EPS · DX Solution Team Manager',
        desc: 'Cloud Full Stack Development, DevOps, DX Solution Discovery'
      },
      period: { ko: '2020.07 – 현재', en: '2020.07 – Present' }
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
      period: { ko: '2014.01 – 2020.07', en: '2014.01 – 2020.07' }
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

<div class="grid gap-16">

  <!-- Hero + Career -->
  <section class="pt-4">
    <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      PRAGMATIC DEVELOPER · CLOUD FULL STACK · DX/AX
    </p>
    <h1 class="mb-4 text-4xl font-black tracking-tight">
      {$lang === 'ko' ? '원준일 (Wonny Won)' : 'Wonny Won (원준일)'}
    </h1>
    <p class="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground">
      {#if $lang === 'ko'}
        발전소 현장 7년, DX 6년 —<br />
        현장의 Pain Point를 DX/AX로 전환하는 프러덕트 엔지니어.<br />
        기획부터 배포·운영까지, 팀과 함께 전 과정을 이끕니다.
      {:else}
        7 years on the plant floor, 6 years in DX —<br />
        a product engineer who turns field pain points into DX/AX solutions.<br />
        Leading end-to-end — from concept to deployment and operations — with the team.
      {/if}
    </p>

    <!-- Career (inline after intro) -->
    <div class="mb-8 grid gap-4 border-l-2 border-foreground/20 pl-5">
      {#each career as job}
        <div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-6">
          <p class="font-semibold">{$lang === 'ko' ? job.ko.company : job.en.company}</p>
          <p class="text-sm text-muted-foreground">
            {$lang === 'ko' ? job.period.ko : job.period.en}
          </p>
        </div>
        <p class="text-sm text-muted-foreground -mt-2 pl-0">
          {$lang === 'ko' ? job.ko.desc : job.en.desc}
        </p>
      {/each}
    </div>

    <div class="no-print flex flex-wrap gap-2">
      <Button variant="outline" size="sm" href="https://github.com/wonny1945" target="_blank" rel="noopener noreferrer">
        GitHub
      </Button>
      <Button variant="outline" size="sm" href="https://linkedin.com/in/준일-원-58975525b" target="_blank" rel="noopener noreferrer">
        LinkedIn
      </Button>
      <Button variant="outline" size="sm" href="https://zdnet.co.kr/view/?no=20251111113533" target="_blank" rel="noopener noreferrer">
        {$lang === 'ko' ? 'ZDNet 인터뷰' : 'ZDNet Interview'}
      </Button>
    </div>
  </section>

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
          aria-label="{$lang === 'ko' ? work.ko.title : work.en.title} — {$lang === 'ko' ? '프로젝트 보기' : 'View project'}"
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

  <!-- Education & Certifications -->
  <section class="pb-8">
    <h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      Education & Certifications
    </h2>
    <p class="text-sm text-muted-foreground">
      {$lang === 'ko' ? education.ko : education.en}
    </p>
    <p class="mt-1 text-sm text-muted-foreground">
      {$lang === 'ko' ? certifications.ko : certifications.en}
    </p>
  </section>

</div>
