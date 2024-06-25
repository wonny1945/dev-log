<script lang="ts">
import { onMount } from 'svelte';
import { Separator } from '$lib/components/ui/separator';
import * as Card from '$lib/components/ui/card';
import { parseMarkdown, markdownToHtml } from '$lib/parseMarkdown';

interface BlogPost {
    title: string;
    date: string;
    content: string;
}

let blogPosts: BlogPost[] = [];
let errorMessage = '';
let debugInfo = '';

async function loadMarkdownFiles() {
    try {
        console.log('Starting to load markdown files...');
        debugInfo += 'Starting to load markdown files...\n';

        // 명시적으로 /mdfiles/ 경로를 지정
        const markdownFiles = import.meta.glob('$lib/mdfiles/*.md', { as: 'raw' });
        console.log('Markdown files found:', Object.keys(markdownFiles));
        debugInfo += `Markdown files found: ${Object.keys(markdownFiles).join(', ')}\n`;

        if (Object.keys(markdownFiles).length === 0) {
            throw new Error('No markdown files found in /mdfiles/ directory');
        }

        for (const path in markdownFiles) {
            console.log(`Processing file: ${path}`);
            debugInfo += `Processing file: ${path}\n`;

            const markdown = await markdownFiles[path]();
            console.log(`Markdown content (first 100 chars): ${markdown.substring(0, 100)}...`);
            debugInfo += `Markdown content loaded for ${path}\n`;

            const { metadata, content: rawContent } = parseMarkdown(markdown);
            const content = markdownToHtml(rawContent);

            blogPosts.push({
                title: metadata.title || 'No Title',
                date: metadata.date || 'No Date',
                content
            });
        }

        blogPosts = blogPosts; // Trigger Svelte reactivity
        console.log('All blog posts loaded:', blogPosts);
        debugInfo += `All blog posts loaded. Total: ${blogPosts.length}\n`;
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
    <h3 class="text-3xl font-bold tracking-tight">Blog Posts</h3>
    <Separator class="-mt-3"/>
    <div class="flex flex-col">
        {#if errorMessage}
            <p class="text-red-500">{errorMessage}</p>
            <pre class="mt-4 p-4 bg-gray-100 rounded">{debugInfo}</pre>
        {:else if blogPosts.length === 0}
            <p>Loading blog posts...</p>
            <pre class="mt-4 p-4 bg-gray-100 rounded">{debugInfo}</pre>
        {:else}
            {#each blogPosts as post}
                <Card.Root class="overflow-hidden mt-4">
                    <Card.Header>
                        <Card.Title>{post.title}</Card.Title>
                        <Card.Description>{post.date}</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        {@html post.content}
                    </Card.Content>
                </Card.Root>
            {/each}
        {/if}
    </div>
</div>