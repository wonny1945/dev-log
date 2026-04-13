<script lang="ts">
	import type { PageData } from './$types';
	import { lang } from '$lib/stores/language';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Printer } from 'lucide-svelte';

	export let data: PageData;
	$: r = data.resume;

	function printResume() {
		window.print();
	}
</script>

<svelte:head>
	<style>
		@media print {
			header, nav, .no-print { display: none !important; }
			main { padding: 0 !important; }
			.print-break { page-break-before: always; }
		}
	</style>
</svelte:head>

<div class="grid gap-6">
	<!-- Header -->
	<div class="flex items-start justify-between">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">
				{$lang === 'ko' ? r.name_ko : r.name_en}
			</h2>
			<p class="mt-1 text-lg text-muted-foreground">
				{$lang === 'ko' ? r.title_ko : r.title_en}
			</p>
			<div class="mt-2 flex gap-4 text-sm text-muted-foreground">
				<a href="mailto:{r.contact.email}" class="hover:text-foreground">{r.contact.email}</a>
				<a href={r.contact.github} target="_blank" rel="noopener" class="hover:text-foreground">GitHub</a>
				<a href={r.contact.linkedin} target="_blank" rel="noopener" class="hover:text-foreground">LinkedIn</a>
			</div>
		</div>
		<Button variant="outline" on:click={printResume} class="no-print gap-2">
			<Printer class="h-4 w-4" />
			{$lang === 'ko' ? 'PDF 저장' : 'Save PDF'}
		</Button>
	</div>

	<Separator />

	<!-- Experience -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{$lang === 'ko' ? '경력' : 'Experience'}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-6">
			{#each r.experience as exp}
				<div>
					<div class="flex items-baseline justify-between">
						<h4 class="font-semibold">
							{$lang === 'ko' ? exp.company_ko : exp.company_en}
						</h4>
						<span class="text-sm text-muted-foreground">{exp.period}</span>
					</div>
					<p class="text-sm text-muted-foreground">
						{$lang === 'ko' ? exp.team_ko : exp.team_en}
					</p>
					{#each exp.roles as role}
						<div class="mt-3 pl-4 border-l-2 border-border">
							<div class="flex items-baseline justify-between">
								<span class="text-sm font-medium">
									{$lang === 'ko' ? role.title_ko : role.title_en}
								</span>
								<span class="text-xs text-muted-foreground">{role.period}</span>
							</div>
							<ul class="mt-1 space-y-1">
								{#each ($lang === 'ko' ? role.highlights_ko : role.highlights_en) as h}
									<li class="text-sm text-muted-foreground before:mr-2 before:content-['·']">{h}</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Skills -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{$lang === 'ko' ? '기술 스택' : 'Skills'}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-3">
			{#each Object.entries(r.skills) as [category, techs]}
				<div class="flex gap-3">
					<span class="w-24 shrink-0 text-sm font-medium text-muted-foreground">{category}</span>
					<div class="flex flex-wrap gap-1.5">
						{#each techs as tech}
							<span class="rounded-md bg-muted px-2 py-0.5 text-xs">{tech}</span>
						{/each}
					</div>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- Education -->
	<Card.Root>
		<Card.Header>
			<Card.Title>{$lang === 'ko' ? '학력' : 'Education'}</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-2">
			{#each r.education as edu}
				<div class="flex items-baseline justify-between">
					<div>
						<span class="font-medium">
							{$lang === 'ko' ? edu.school_ko : edu.school_en}
						</span>
						<span class="ml-2 text-sm text-muted-foreground">
							{$lang === 'ko' ? edu.major_ko : edu.major_en}
						</span>
					</div>
					<span class="text-sm text-muted-foreground">{edu.period}</span>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>
</div>
