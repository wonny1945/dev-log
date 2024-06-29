// $lib/parseMarkdown.ts
import { marked } from 'marked';

export interface WorkMetadata {
    title: string;
    'Project Duration': string;
    'Project Overview': string;
    'Applied Technologies': string;
    'Key Roles': string;
    screenshots: string[];
}

export function parseMarkdown(markdown: string): { metadata: WorkMetadata; content: string } {
    const metadata: Partial<WorkMetadata> = {};
    const contentLines = markdown.split('\n');
    let content = '';
    let inMetadata = false;

    for (const line of contentLines) {
        if (line.trim() === '---') {
            inMetadata = !inMetadata;
            continue;
        }
        if (inMetadata) {
            const [key, ...valueParts] = line.split(':').map(part => part.trim());
            const value = valueParts.join(':').trim();
            if (key && value) {
                if (key === 'screenshots') {
                    metadata[key] = JSON.parse(value);
                } else {
                    metadata[key as keyof WorkMetadata] = value;
                }
            }
        } else {
            content += line + '\n';
        }
    }

    return { metadata: metadata as WorkMetadata, content };
}

export function markdownToHtml(markdown: string): string {
    return marked(markdown);
}