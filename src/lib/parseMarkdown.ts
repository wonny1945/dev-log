import { marked } from "marked";

export interface ProjectMetadata {
  title_ko: string;
  title_en: string;
  category: string;        // '개발' | 'dx-ax' | '사이드'
  tags: string;            // comma-separated: '개발, 발표'
  duration: string;
  overview_ko: string;
  overview_en: string;
  role_ko: string;
  role_en: string;
  tech: string;
  achievement: string;
  thumbnail: string;
  screenshots: string[];
}

export interface Project extends ProjectMetadata {
  techList: string[];
  tagList: string[];
  content: string;
}

export function parseMarkdown(markdown: string): {
  metadata: ProjectMetadata;
  content: string;
} {
  const metadata: Partial<ProjectMetadata> = {};
  const lines = markdown.split("\n");
  let content = "";
  let inFrontmatter = false;
  let frontmatterDone = false;
  let dashCount = 0;

  for (const line of lines) {
    if (line.trim() === "---" && dashCount < 2) {
      dashCount++;
      inFrontmatter = dashCount === 1;
      if (dashCount === 2) {
        inFrontmatter = false;
        frontmatterDone = true;
      }
      continue;
    }
    if (inFrontmatter) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (!key || !value) continue;
      if (key === "screenshots") {
        (metadata as Record<string, unknown>)[key] = JSON.parse(value);
      } else {
        (metadata as Record<string, unknown>)[key] = value;
      }
    } else if (frontmatterDone) {
      content += line + "\n";
    }
  }

  return { metadata: metadata as ProjectMetadata, content };
}

export function markdownToHtml(markdown: string): string {
  return marked(markdown) as string;
}
