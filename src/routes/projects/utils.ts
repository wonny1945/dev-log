import type { Project } from "$lib/parseMarkdown";

export type FilterType = "all" | "개발" | "dx-ax" | "사이드" | "발표";

function getEndDate(duration: string): string {
  if (duration.includes("~")) {
    const end = duration.split("~")[1].trim();
    return end === "" ? "9999.99" : end;
  }
  return duration;
}

export function sortByDuration(projects: Project[]): Project[] {
  return [...projects].sort((a, b) =>
    getEndDate(b.duration).localeCompare(getEndDate(a.duration)),
  );
}

export function filterProjects(
  projects: Project[],
  filter: FilterType,
): Project[] {
  if (filter === "all") return projects;
  return projects.filter((p) => p.tagList.includes(filter));
}
