<script lang="ts">
	import type { PageData } from './$types';
	import { lang } from '$lib/stores/language';
	import { filterProjects, groupByYear, type FilterType } from './utils';
	import { Separator } from '$lib/components/ui/separator';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	export let data: PageData;

	let filter: FilterType = 'all';

	$: filtered = filterProjects(data.projects, filter);
	$: grouped = groupByYear(filtered);

	const FILTER_LABELS: Record<FilterType, { ko: string; en: string }> = {
		all: { ko: '전체', en: 'All' },
		개발: { ko: '개발', en: 'Dev' },
		'dx-ax': { ko: 'DX · AX', en: 'DX · AX' },
		사이드: { ko: '사이드', en: 'Side' },
		발표: { ko: '발표', en: 'Talk' }
	};

	const FILTER_KEYS: FilterType[] = ['all', '개발', 'dx-ax', '사이드'];
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

	<!-- Year groups -->
	{#each grouped as group}
		<div>
			<h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
				{group.year}
			</h2>
			<div class="divide-y">
				{#each group.projects as project (project.title_en)}
					{#if project.url}
						<!-- 사이드 프로젝트: 외부 링크 -->
						<a
							href={project.url}
							target="_blank"
							rel="noopener noreferrer"
							class="flex w-full items-start justify-between gap-3 py-5 transition-colors hover:bg-muted/30"
						>
							<div class="min-w-0 flex-1">
								<div class="mb-1 flex flex-wrap items-center gap-2">
									<span class="font-bold">
										{$lang === 'ko' ? project.title_ko : project.title_en}
									</span>
									{#each project.tagList as tag}
										<span class="rounded border px-2 py-0.5 text-xs text-foreground/70">
											{tag === 'dx-ax' ? 'DX · AX' : tag}
										</span>
									{/each}
								</div>
								<p class="text-sm text-muted-foreground">
									{$lang === 'ko' ? project.overview_ko : project.overview_en}
								</p>
							</div>
							<ExternalLink class="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
						</a>
					{:else}
						<!-- 업무 프로젝트: 비클릭 -->
						<div class="py-5">
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
								{#if project.achievement === '진행 중'}
									<span
										class="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400"
										>진행 중</span
									>
								{:else if project.achievement}
									<span class="shrink-0 text-sm font-bold">{project.achievement}</span>
								{/if}
							</div>
							<p class="mb-3 text-sm text-muted-foreground">
								{$lang === 'ko' ? project.overview_ko : project.overview_en}
							</p>
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
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>
