<script lang="ts">
    import {page} from '$app/stores';
    import '../app.css';
    import {base} from '$app/paths';
    import {onMount, onDestroy} from 'svelte';
    import {browser} from '$app/environment'; // 클라이언트 환경 체크
    import type {Unsubscriber} from 'svelte/store';
    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";
    import {toggleMode} from "mode-watcher";
    import {Button} from "$lib/components/ui/button/index.js";

    // 메뉴 정의
    const menus = [
        {name: "About", path: `${base}/`},
        {name: "Blog", path: "https://medium.com/@wonny1945"},
        {name: "Work", path: `${base}/Work`}
    ];

    let url: string = '';

    // 경로 업데이트 함수
    const updatePath = () => {
        url = $page.url.pathname;

    };

    let unsubscribe: Unsubscriber;

    // 클라이언트에서만 실행
    if (browser) {
        // 컴포넌트 마운트 시 초기화
        onMount(() => {
            // 경로 초기화
            updatePath();

            // 페이지 스토어 구독
            unsubscribe = page.subscribe(() => {
                updatePath();
            });

            // popstate 이벤트 추가
            window.addEventListener('popstate', updatePath);
        });

        // 컴포넌트 파괴 시 정리
        onDestroy(() => {
            if (unsubscribe) unsubscribe(); // 구독 해제
            window.removeEventListener('popstate', updatePath); // 이벤트 제거
        });
    }
</script>


<div class="flex min-h-screen w-full flex-col">
    <header class="sticky top-0 flex h-16 items-center justify-between border-b bg-muted/40 px-4 md:px-6 bg">
        <p class="text-lg font-semibold">Wonny dev-log</p>
        <div class="flex-grow"></div>
        <Button on:click={toggleMode} variant="outline" size="icon">
            <Sun
                    class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Moon
                    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span class="sr-only">Toggle theme</span>
        </Button>
    </header>
    <main
            class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10 bg"
    >
        <div class="mx-auto w-full max-w-6xl gap-2 flex flex-col ">
            <div class="w-11 h-11 animate-bounce ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
                    <rect x="10" y="20" width="30" height="20" style="fill:none;stroke:#000000;"/>
                    <rect x="10" y="10" width="10" height="10" style="fill:none;stroke:#000000;"/>
                    <rect x="30" y="10" width="10" height="10" style="fill:none;stroke:#000000;"/>
                    <circle cx="20" cy="30" r="2" style="fill:#000000;"/>
                    <circle cx="30" cy="30" r="2" style="fill:#000000;"/>
                    <line x1="20" y1="35" x2="30" y2="35" style="stroke:#000000;"/>
                </svg>
            </div>
            <h1 class="text-3xl font-semibold">I'm hop</h1>
        </div>
        <div
                class="mx-auto grid w-full max-w-6xl items-start gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]  "
        >
            <nav class="grid gap-3 text-sm text-muted-foreground"
                 data-x-chunk-container="chunk-container after:right-0">

                <a href="{base}/"
                   class="transition-colors hover:text-foreground {url ==='/' ? 'font-semibold text-primary' : 'text-muted-foreground'}">
                    About
                </a>

                <a href="https://medium.com/@wonny1945"
                   class="transition-colors hover:text-foreground {url === 'https://medium.com/@wonny1945' ? 'font-semibold text-primary' : 'text-muted-foreground'}">
                    blog
                </a>

                <a href="{base}/Work"
                   class="transition-colors hover:text-foreground {url === '/Work' ? 'font-semibold text-primary' : 'text-muted-foreground'}">
                    Work
                </a>

            </nav>
            <slot>
            </slot>

        </div>
    </main>
</div>
