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

export function groupByYear(projects: Project[]): { year: string; projects: Project[] }[] {
  const groups: Record<string, Project[]> = {};
  for (const p of projects) {
    const year = p.duration.slice(0, 4);
    if (!groups[year]) groups[year] = [];
    groups[year].push(p);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, projects]) => ({ year, projects }));
}
