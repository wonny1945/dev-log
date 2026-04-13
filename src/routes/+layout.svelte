<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import { base } from '$app/paths';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { Unsubscriber } from 'svelte/store';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { lang, toggleLang } from '$lib/stores/language';

	const menus = [
		{ name: 'About', nameEn: 'About', path: `${base}/`, external: false },
		{ name: '프로젝트', nameEn: 'Projects', path: `${base}/projects`, external: false },
		{ name: '이력서', nameEn: 'Resume', path: `${base}/resume`, external: false },
		{ name: 'Blog', nameEn: 'Blog', path: 'https://medium.com/@wonny1945', external: true }
	];

	let url: string = '';

	const updatePath = () => {
		url = $page.url.pathname;
	};

	let unsubscribe: Unsubscriber;

	if (browser) {
		onMount(() => {
			updatePath();
			unsubscribe = page.subscribe(() => {
				updatePath();
			});
			window.addEventListener('popstate', updatePath);
		});

		onDestroy(() => {
			if (unsubscribe) unsubscribe();
			window.removeEventListener('popstate', updatePath);
		});
	}
</script>

<div class="flex min-h-screen w-full flex-col">
	<header class="sticky top-0 flex h-16 items-center justify-between border-b bg-muted/40 px-4 md:px-6">
		<p class="text-lg font-semibold">Wonny dev-log</p>
		<div class="flex-grow"></div>
		<div class="flex items-center gap-2">
			<!-- KO/EN 토글 -->
			<Button variant="outline" size="sm" on:click={toggleLang} class="text-xs font-semibold">
				{$lang === 'ko' ? 'EN' : 'KO'}
			</Button>
			<!-- 다크모드 토글 -->
			<Button on:click={toggleMode} variant="outline" size="icon">
				<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
				<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</header>
	<main class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
		<div class="mx-auto w-full max-w-6xl gap-2 flex flex-col">
			<div class="w-11 h-11 animate-bounce">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"
					class="stroke-black fill-none dark:stroke-white">
					<rect x="10" y="20" width="30" height="20"/>
					<rect x="10" y="10" width="10" height="10"/>
					<rect x="30" y="10" width="10" height="10"/>
					<circle cx="20" cy="30" r="2" class="fill-black dark:fill-white"/>
					<circle cx="30" cy="30" r="2" class="fill-black dark:fill-white"/>
					<line x1="20" y1="35" x2="30" y2="35"/>
				</svg>
			</div>
			<h1 class="text-3xl font-semibold">I'm hop</h1>
		</div>
		<div class="mx-auto grid w-full max-w-6xl items-start gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
			<nav class="grid gap-3 text-sm text-muted-foreground">
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
			</nav>
			<slot></slot>
		</div>
	</main>
</div>
