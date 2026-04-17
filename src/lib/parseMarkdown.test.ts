import { parseMarkdown, markdownToHtml } from "./parseMarkdown";

const SAMPLE_MD = `---
title_ko: 테스트 프로젝트
title_en: Test Project
category: 개발
tags: 개발, 발표
duration: 2022.01 ~ 2022.03
overview_ko: 테스트 개요
overview_en: Test overview
role_ko: FE 개발자
role_en: FE Developer
tech: Python, Vue, Docker
achievement: 80% 시간 단축
thumbnail: /images/test-thumb.png
screenshots: ["/images/test-1.png", "/images/test-2.png"]
---
본문 내용`;

describe("parseMarkdown", () => {
  it("새 frontmatter 필드를 파싱한다", () => {
    const { metadata } = parseMarkdown(SAMPLE_MD);
    expect(metadata.title_ko).toBe("테스트 프로젝트");
    expect(metadata.title_en).toBe("Test Project");
    expect(metadata.category).toBe("개발");
    expect(metadata.tags).toBe("개발, 발표");
    expect(metadata.duration).toBe("2022.01 ~ 2022.03");
    expect(metadata.overview_ko).toBe("테스트 개요");
    expect(metadata.role_ko).toBe("FE 개발자");
    expect(metadata.tech).toBe("Python, Vue, Docker");
    expect(metadata.thumbnail).toBe("/images/test-thumb.png");
  });

  it("screenshots를 배열로 파싱한다", () => {
    const { metadata } = parseMarkdown(SAMPLE_MD);
    expect(metadata.screenshots).toEqual([
      "/images/test-1.png",
      "/images/test-2.png",
    ]);
  });

  it("본문 컨텐츠를 반환한다", () => {
    const { content } = parseMarkdown(SAMPLE_MD);
    expect(content.trim()).toBe("본문 내용");
  });

  it("markdownToHtml: 마크다운을 HTML로 변환한다", () => {
    const html = markdownToHtml("**bold**");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("parses url field from frontmatter", () => {
    const md = `---
title_ko: 테스트
title_en: Test
category: 사이드
tags: 사이드
duration: 2024 ~
overview_ko: 설명
overview_en: Description
role_ko: 개발
role_en: Dev
tech: SvelteKit
achievement: ""
url: https://example.com/
thumbnail: ""
screenshots: []
---
`;
    const { metadata } = parseMarkdown(md);
    expect(metadata.url).toBe("https://example.com/");
  });

  it("url is undefined when not present in frontmatter", () => {
    const md = `---
title_ko: 테스트
title_en: Test
category: 개발
tags: 개발
duration: 2024 ~
overview_ko: 설명
overview_en: Description
role_ko: 개발
role_en: Dev
tech: SvelteKit
achievement: ""
thumbnail: ""
screenshots: []
---
`;
    const { metadata } = parseMarkdown(md);
    expect(metadata.url).toBeUndefined();
  });
});
