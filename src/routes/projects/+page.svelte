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

	const FILTER_KEYS: FilterType[] = ['all', 'work', 'side'];
</script>

<div class="grid gap-6">
	<h3 class="text-3xl font-bold tracking-tight">
		{$lang === 'ko' ? '프로젝트' : 'Projects'}
	</h3>
	<Separator class="-mt-3" />

	<!-- Filter tabs -->
	<div class="flex gap-2">
		{#each FILTER_KEYS as key}
			<button
				class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors
				{filter === key
					? 'bg-foreground text-background'
					: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
				on:click={() => (filter = key)}
			>
				{$lang === 'ko' ? FILTER_LABELS[key].ko : FILTER_LABELS[key].en}
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
