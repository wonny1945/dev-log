import { sortByDuration, filterProjects } from "./utils";
import type { Project } from "$lib/parseMarkdown";

const makeProject = (
  duration: string,
  category: string,
  tags: string,
): Project => ({
  title_ko: "테스트",
  title_en: "Test",
  category,
  tags,
  duration,
  overview_ko: "",
  overview_en: "",
  role_ko: "",
  role_en: "",
  tech: "",
  achievement: "",
  thumbnail: "",
  screenshots: [],
  techList: [],
  tagList: tags.split(",").map((t) => t.trim()),
  content: "",
});

describe("sortByDuration", () => {
  it("종료일 기준 내림차순 정렬", () => {
    const projects = [
      makeProject("2021.03 ~ 2021.06", "개발", "개발"),
      makeProject("2024.06 ~", "개발", "개발"),
      makeProject("2022.01 ~ 2022.03", "개발", "개발"),
    ];
    const sorted = sortByDuration(projects);
    expect(sorted[0].duration).toBe("2024.06 ~");
    expect(sorted[1].duration).toBe("2022.01 ~ 2022.03");
    expect(sorted[2].duration).toBe("2021.03 ~ 2021.06");
  });
});

describe("filterProjects", () => {
  const projects = [
    makeProject("2022.01 ~ 2022.03", "개발", "개발, 발표"),
    makeProject("2023.01 ~", "사이드", "사이드"),
    makeProject("2023.06 ~", "dx-ax", "dx-ax, 발표"),
  ];

  it("all: 전체 반환", () => {
    expect(filterProjects(projects, "all")).toHaveLength(3);
  });

  it("개발: category 개발만 반환", () => {
    const result = filterProjects(projects, "개발");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("개발");
  });

  it("사이드: category 사이드만 반환", () => {
    const result = filterProjects(projects, "사이드");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("사이드");
  });

  it("dx-ax: category dx-ax만 반환", () => {
    const result = filterProjects(projects, "dx-ax");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("dx-ax");
  });

  it("발표: tagList에 발표 포함된 항목만 반환", () => {
    const result = filterProjects(projects, "발표");
    expect(result).toHaveLength(2);
  });
});
