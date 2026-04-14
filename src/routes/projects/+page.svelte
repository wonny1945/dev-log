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
		all: { ko: '전체', en: 'All' },
		개발: { ko: '개발', en: 'Dev' },
		'dx-ax': { ko: 'DX · AX', en: 'DX · AX' },
		사이드: { ko: '사이드', en: 'Side' },
		발표: { ko: '발표', en: 'Talk' }
	};

	const FILTER_KEYS: FilterType[] = ['all', '개발', 'dx-ax', '사이드', '발표'];

	function getYear(duration: string): string {
		return duration.slice(0, 4);
	}
</script>

<div class="grid gap-6">
	<h1 class="text-2xl font-bold tracking-tight">
		{$lang === 'ko' ? '프로젝트' : 'Projects'}
	</h1>
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
