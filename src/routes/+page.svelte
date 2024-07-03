<script lang="ts">
	import Github from 'lucide-svelte/icons/github';
	import Linkedin from 'lucide-svelte/icons/linkedin';
	import Mail from 'lucide-svelte/icons/mail';
	import { SquareCode } from 'lucide-svelte';
	import { Server } from 'lucide-svelte';
	import { Database } from 'lucide-svelte';
	import { HandHeart } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card/index.js';
	import { base } from '$app/paths'
</script>

			<div class="grid gap-6">
				<h3 class="text-3xl font-bold tracking-tight">Hello I'm Wonny</h3>
				    <Separator class="-mt-3"/>
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">I'm a pragmatic developer 🧑‍💻</Card.Title>
						<Card.Description>
							I am not tied to specific languages or technologies, but focus on how to think about and solve problems.
							<br />Beyond just writing software that works, I strive to create software that is maintainable and can
							adapt as the world changes.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Card.Title class="text-2xl">Also, I'm a subject matter expert in power plant 🏭</Card.Title>
						<Card.Description>
							I have special experience in operating and managing CFBC type biomass power plants, and possess knowledge
							in the domain of general power plant and digital transformation.
						</Card.Description>
					</Card.Content>
					<Card.Footer class="border-t px-6 py-2 justify-end gap-1">
						<Button variant="outline">
							<a href="https://github.com/wonny1945" rel="prefetch" class="flex items-center">
								<Github class="mr-2 h-4 w-4" />
								GitHub
							</a></Button>
						<Button variant="outline">
							<a href="https://www.linkedin.com/in/%EC%A4%80%EC%9D%BC-%EC%9B%90-58975525b/" rel="prefetch"
								 class="flex items-center">
								<Linkedin class="mr-2 h-4 w-4" />
								LinkedIn
							</a>
						</Button>
						<Button variant="outline">
							<a href="mailto:wonny1945@gmail.com" class="flex items-center">
								<Mail class="mr-2 h-4 w-4" />
								Mail
							</a>
						</Button>
					</Card.Footer>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">Skills & Works</Card.Title>
						<Card.Description>
							I am a developer, data engineer, and problem solver with the following skills.
							<br/>
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid grid-cols-4 w-auto gap-2 pointer-events-none">
							<div class="flex flex-col">
								<Button variant="outline" class="h-auto w-fix bg-neutral-50 dark:bg-muted">
									<SquareCode class="h-8 w-6 mr-1.5 hidden sm:block" />
									Frontend
								</Button>
								<Button class="w-fix mt-2 " variant="outline">Javascript</Button>
								<Button class="w-fix mt-2" variant="outline">Sveltekit</Button>
								<Button class="w-fix mt-2" variant="outline">Vue</Button>
							</div>
							<div class="flex flex-col ">
								<Button variant="outline" class="h-auto w-fix bg-neutral-50 dark:bg-muted ">
									<Database class="h-8 w-6 mr-1.5 hidden sm:block" />
									DevOps
								</Button>
								<Button class="w-fix mt-2 " variant="outline">AWS&CDK</Button>
								<Button class="w-fix mt-2 " variant="outline">Airflow</Button>
								<Button class="w-fix mt-2 " variant="outline">Streamlit</Button>
							</div>

							<div class="flex flex-col">
							<Button variant="outline" class="h-auto w-fix bg-neutral-50 dark:bg-muted">
									<Server class="h-8 w-6 mr-1.5 hidden sm:block" />
									Backend
								</Button>
								<Button class="w-fix mt-2 " variant="outline">Python</Button>
								<Button class="w-fix mt-2 " variant="outline">Django</Button>
							</div>

							<div class="flex flex-col">
								<Button variant="outline" class="h-auto w-fix bg-neutral-50 dark:bg-muted">
									<HandHeart class="h-8 w-6 mr-1.5 hidden sm:block" />
									Loves
								</Button>
								<Button class="w-fix mt-2 " variant="outline">Agile Dev</Button>
								<Button class="w-fix mt-2 " variant="outline">TDD</Button>
								<Button class="w-fix mt-2 " variant="outline">CI/CD</Button>
							</div>
						</div>


					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-2xl">Work Experience</Card.Title>
						<Card.Description>
							I am currently focusing on my work as a data engineer, spearheading the digital transformation of power
							plants
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="grid gap-3">
							<div class="font-semibold flex justify-between">Digital Transformation Team <span
								class="text-sm">5 year</span></div>
							<Separator class="-mt-2" />
							<ul class="grid text-sm -mt-3">
								<li class="flex items-center justify-between">
                  <span class="text-muted-foreground">
                    Data Engineer
                  </span>
								</li>
								<li class="flex items-center justify-between">
                  <span class="text-muted-foreground">
                    Software Developer
                  </span>
								</li>
								<li class="flex items-center justify-between">
                  <span class="text-muted-foreground">
                    Power Plant DX Solution Review and Introduction
                  </span>
								</li>
							</ul>

							<div class="font-semibold flex justify-between">Power Plant Operation Team <span
								class="text-sm">7 year</span></div>
							<Separator class="-mt-2" />
							<ul class="grid text-sm -mt-3">
								<li class="flex items-center justify-between">
                  <span class="text-muted-foreground">
                   CFBC Boiler Operation
                  </span>
								</li>
								<li class="flex items-center justify-between">
                  <span class="text-muted-foreground">
                    Operational Administrative Support
                  </span>
								</li>

							</ul>

						</div>

					</Card.Content>
				</Card.Root>

			</div>

