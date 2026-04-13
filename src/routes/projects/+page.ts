import { parseMarkdown, markdownToHtml } from "$lib/parseMarkdown";
import type { Project } from "$lib/parseMarkdown";
import { sortByDuration } from "./utils";
import type { PageLoad } from "./$types";

export const prerender = true;

export const load: PageLoad = async () => {
  const files = import.meta.glob("$lib/mdfiles/*.md", {
    as: "raw",
    eager: false,
  });
  const projects: Project[] = [];

  for (const path in files) {
    const raw = (await files[path]()) as string;
    const { metadata, content } = parseMarkdown(raw);
    projects.push({
      ...metadata,
      techList: metadata.tech.split(",").map((t) => t.trim()),
      content: markdownToHtml(content),
    });
  }

  return { projects: sortByDuration(projects) };
};
