<script lang="ts">
  import { page } from '$app/stores';
  import '../app.css';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';
  import { toggleMode } from 'mode-watcher';
  import { Button } from '$lib/components/ui/button/index.js';
  import { lang, toggleLang } from '$lib/stores/language';

  const menus = [
    { label: 'About', path: `${base}/`, external: false },
    { label: 'Projects', path: `${base}/projects`, external: false },
    { label: 'Blog', path: 'https://medium.com/@wonny1945', external: true }
  ];

  let scrollY = 0;
  $: scrolled = scrollY > 10;

  $: currentPath = browser ? $page.url.pathname : '';
</script>

<svelte:window bind:scrollY />

<div class="flex min-h-screen w-full flex-col">
  <header
    class="sticky top-0 z-50 grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 transition-all duration-200 md:px-8
      {scrolled ? 'border-b bg-background/95 backdrop-blur-sm' : 'bg-transparent'}"
  >
    <div></div>
    <nav class="flex items-center gap-6 text-sm">
      {#each menus as menu}
        <a
          href={menu.path}
          target={menu.external ? '_blank' : undefined}
          rel={menu.external ? 'noopener noreferrer' : undefined}
          aria-current={currentPath === menu.path || (menu.path === `${base}/` && currentPath === `${base}`) ? 'page' : undefined}
          class="transition-colors hover:text-foreground
            {currentPath === menu.path || (menu.path === `${base}/` && currentPath === `${base}`)
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground'}"
        >
          {menu.label}
        </a>
      {/each}
    </nav>
    <div class="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" on:click={toggleLang} class="text-xs font-semibold">
        {$lang === 'ko' ? 'EN' : 'KO'}
      </Button>
      <Button on:click={toggleMode} variant="outline" size="icon">
        <Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
  </header>

  <main class="mx-auto w-full max-w-3xl px-4 py-10">
    <slot></slot>
  </main>
</div>
