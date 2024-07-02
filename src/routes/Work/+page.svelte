<script lang="ts">
    import {onMount} from 'svelte';
    import {Separator} from '$lib/components/ui/separator';
    import * as Card from '$lib/components/ui/card';
    import {parseMarkdown, markdownToHtml} from '$lib/parseMarkdown';
    import type {WorkMetadata} from '$lib/parseMarkdown';
    import {CalendarCheck2} from 'lucide-svelte';
    import {Layers} from 'lucide-svelte';
    import {NotebookPen} from 'lucide-svelte';
    import * as Drawer from "$lib/components/ui/drawer";
    import {Button} from "$lib/components/ui/button";
    import {ProjectCard} from "$lib/components/ui/project-card";

    interface Work extends WorkMetadata {
        content: string;
    }

    let works: Work[] = [];
    let errorMessage = '';
    let debugInfo = '';

    async function loadMarkdownFiles() {
        try {
            const markdownFiles = import.meta.glob('$lib/mdfiles/*.md', {as: 'raw'});
            if (Object.keys(markdownFiles).length === 0) {
                throw new Error('No markdown files found in /mdfiles/ directory');
            }

            for (const path in markdownFiles) {
                console.log(`Processing file: ${path}`);
                debugInfo += `Processing file: ${path}\n`;
                const markdown = await markdownFiles[path]();
                const {metadata, content: rawContent} = parseMarkdown(markdown);
                const content = markdownToHtml(rawContent);

                works.push({
                    ...metadata,
                    content
                });
            }

            works = works;
            console.log('All works loaded:', works);
            debugInfo += `All works loaded. Total: ${works.length}\n`;
        } catch (error) {
            console.error('Error loading markdown files:', error);
            errorMessage = 'Error loading content: ' + (error instanceof Error ? error.message : String(error));
            debugInfo += `Error: ${errorMessage}\n`;
        }
    }

    onMount(() => {
        loadMarkdownFiles();
    });
</script>

<div class="grid gap-6">
    <h3 class="text-3xl font-bold tracking-tight">Work</h3>
    <Separator class="-mt-3"/>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {#each works as work (work.title)}
        <ProjectCard {work}/>
    {/each}
</div>
</div>



