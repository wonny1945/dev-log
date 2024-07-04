<script lang="ts">
    import {CalendarCheck2, Layers, NotebookPen} from "lucide-svelte";
    import {Button} from "$lib/components/ui/button/index.js";
    import * as Card from '$lib/components/ui/card';
    import * as Drawer from "$lib/components/ui/drawer";
    import type {WorkMetadata} from '$lib/parseMarkdown';
    import {base} from "$app/paths"


    interface Work extends WorkMetadata {
        content: string;
    }

    export let work: Work;
</script>


<Card.Root class="overflow-hidden">
    <Card.Header>
        <Card.Title>{work.title}</Card.Title>
        <Card.Description>{work['Project Overview']}</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
            <CalendarCheck2 class="mt-px h-5 w-5"/>
            <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Project Duration</p>
                <p class="text-sm text-muted-foreground">{work['Project Duration']}</p>
            </div>
        </div>
        <div class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
            <Layers class="mt-px h-5 w-5"/>
            <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Stack</p>
                <p class="text-sm text-muted-foreground">{work['Applied Technologies']}</p>
            </div>
        </div>
        <div class="-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
        >
            <NotebookPen class="mt-px h-5 w-5"/>
            <div class="space-y-1">
                <p class="text-sm font-medium leading-none">Key Roles</p>
                <p class="text-sm text-muted-foreground">{work['Key Roles']}</p>
            </div>
        </div>
    </Card.Content>
</Card.Root>