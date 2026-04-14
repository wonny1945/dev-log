<script lang="ts">
	import { lang } from '$lib/stores/language';
	import type { Project } from '$lib/parseMarkdown';
	import * as Dialog from '$lib/components/ui/dialog';
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import type { EmblaCarouselType } from 'embla-carousel';

	export let project: Project | null = null;
	export let open = false;

	let emblaApi: EmblaCarouselType | undefined;
	let currentIndex = 0;

	function onInit(event: CustomEvent<EmblaCarouselType>) {
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
				<Dialog.Title class="mt-1 text-xl">
					{$lang === 'ko' ? project.title_ko : project.title_en}
				</Dialog.Title>
			</Dialog.Header>

			<!-- Image slider -->
			{#if project.screenshots.length > 0}
				<div class="relative mt-2 overflow-hidden rounded-lg bg-muted">
					<div
						use:emblaCarouselSvelte={{ options: { loop: false }, plugins: [] }}
						on:emblaInit={onInit}
					>
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
