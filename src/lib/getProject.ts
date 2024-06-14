import { json } from '@sveltejs/kit';


export type Post = {
	tile: string;
	slug: string;
	description: string;
	date: string;
	category: string[];

}

export async function getPosts() {
	let posts: Post[] = [];

	const paths = import.meta.glob('/src/project/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const metadata = file.metadata as Omit<Post, 'slug'>;
			const post = { ...metadata, slug } satisfies Post;
			console.log(post);
		}
	}

	posts = posts.sort(
		(first, second) =>
			new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return posts;
}

export async function GET() {
	const posts = await getPosts();
	return json(posts);

	}