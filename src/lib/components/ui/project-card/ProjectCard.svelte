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
	<!-- Tags + Duration -->
	<div class="flex items-center justify-between px-4 pt-4">
		<div class="flex flex-wrap gap-1">
			{#each project.tagList as tag}
				<span
					class="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide
					{tag === '개발'
						? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
						: tag === 'dx-ax'
							? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
							: tag === '발표'
								? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
								: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}"
				>
					{tag}
				</span>
			{/each}
		</div>
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
