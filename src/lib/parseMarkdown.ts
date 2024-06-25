// $lib/parseMarkdown.ts
import { marked } from 'marked';

export function parseMarkdown(markdown: string) {
    const metadata: Record<string, string> = {};
    const contentLines = markdown.split('\n');
    let content = '';
    let inMetadata = false;

    for (const line of contentLines) {
        if (line.trim() === '---') {
            inMetadata = !inMetadata;
            continue;
        }
        if (inMetadata) {
            const [key, value] = line.split(':').map(part => part.trim());
            if (key && value) {
                metadata[key] = value;
            }
        } else {
            content += line + '\n';
        }
    }

    return { metadata, content };
}

export function markdownToHtml(markdown: string): string {
    const renderer = new marked.Renderer();

    // Customize renderer to add Tailwind classes
    renderer.heading = (text, level) => {
        const sizes = ['text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base'];
        return `<h${level} class="font-bold ${sizes[level-1]} my-4">${text}</h${level}>`;
    };

    renderer.paragraph = (text) => {
        return `<p class="my-2 text-gray-700">${text}</p>`;
    };

    renderer.list = (body, ordered) => {
        const type = ordered ? 'ol' : 'ul';
        const className = ordered ? 'list-decimal' : 'list-disc';
        return `<${type} class="${className} pl-6 my-4">${body}</${type}>`;
    };

    renderer.listitem = (text) => {
        return `<li class="mb-1">${text}</li>`;
    };

    renderer.link = (href, title, text) => {
        return `<a href="${href}" class="text-blue-600 hover:underline"${title ? ` title="${title}"` : ''}>${text}</a>`;
    };

    renderer.image = (href, title, text) => {
        return `<img src="${href}" alt="${text}" class="my-4 rounded-lg shadow-md h-1/2 w-1/2"${title ? ` title="${title}"` : ''}>`;
    };

    renderer.blockquote = (quote) => {
        return `<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic">${quote}</blockquote>`;
    };

    renderer.code = (code, language) => {
        return `<pre class="bg-gray-100 rounded p-4 my-4"><code class="language-${language}">${code}</code></pre>`;
    };

    renderer.hr = () => {
        return `<hr class="my-8 border-t border-gray-300">`;
    };

    marked.setOptions({ renderer });
    return marked(markdown);
}