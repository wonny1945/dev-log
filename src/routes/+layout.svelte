<script>
	import '../app.css';
	import { base } from '$app/paths';
</script>


<div class="flex min-h-screen w-full flex-col">
	<header class="sticky top-0 flex h-16 items-center gap-4 border-b bg-muted/40 px-4 md:px-6 bg">
		<p class="text-lg font-semibold">Wonny dev-log</p>
	</header>
	<main
		class="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10 bg"
	>
		<div class="mx-auto w-full max-w-6xl gap-2 flex flex-col ">
			<div class="w-11 h-11 animate-bounce ">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
					<!-- 토끼의 몸체를 나타내는 사각형 -->
					<rect x="10" y="20" width="30" height="20" style="fill:none;stroke:#000000;" />
					<!-- 토끼의 귀를 나타내는 사각형 -->
					<rect x="10" y="10" width="10" height="10" style="fill:none;stroke:#000000;" />
					<rect x="30" y="10" width="10" height="10" style="fill:none;stroke:#000000;" />
					<!-- 토끼의 눈을 나타내는 원 -->
					<circle cx="20" cy="30" r="2" style="fill:#000000;" />
					<circle cx="30" cy="30" r="2" style="fill:#000000;" />
					<!-- 토끼의 콧수염을 나타내는 선 -->
					<line x1="20" y1="35" x2="30" y2="35" style="stroke:#000000;" />
				</svg>
			</div>
			<h1 class="text-3xl font-semibold">I'm hop</h1>
		</div>
		<div
			class="mx-auto grid w-full max-w-6xl items-start gap-4 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]  "
		>
			<nav class="grid gap-3 text-sm text-muted-foreground"
					 data-x-chunk-container="chunk-container after:right-0">
				<a href={base+"/"} class="font-semibold text-primary transition-colors hover:text-foreground"> About </a>
				<a href="https://medium.com/@wonny1945" class="text-muted-foreground transition-colors hover:text-foreground">Blog</a>
				<a href={base+"/work"} class="text-muted-foreground transition-colors hover:text-foreground">Work</a>
			</nav>
			<slot>
			</slot>

		</div>
	</main>
</div>
