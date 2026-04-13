import { parseMarkdown, markdownToHtml } from './parseMarkdown';

const SAMPLE_MD = `---
title_ko: 테스트 프로젝트
title_en: Test Project
type: work
duration: 2022.01 ~ 2022.03
overview_ko: 테스트 개요
overview_en: Test overview
role_ko: FE 개발자
role_en: FE Developer
tech: Python, Vue, Docker
thumbnail: /images/test-thumb.png
screenshots: ["/images/test-1.png", "/images/test-2.png"]
---
본문 내용`;

describe('parseMarkdown', () => {
  it('새 frontmatter 필드를 파싱한다', () => {
    const { metadata } = parseMarkdown(SAMPLE_MD);
    expect(metadata.title_ko).toBe('테스트 프로젝트');
    expect(metadata.title_en).toBe('Test Project');
    expect(metadata.type).toBe('work');
    expect(metadata.duration).toBe('2022.01 ~ 2022.03');
    expect(metadata.overview_ko).toBe('테스트 개요');
    expect(metadata.role_ko).toBe('FE 개발자');
    expect(metadata.tech).toBe('Python, Vue, Docker');
    expect(metadata.thumbnail).toBe('/images/test-thumb.png');
  });

  it('screenshots를 배열로 파싱한다', () => {
    const { metadata } = parseMarkdown(SAMPLE_MD);
    expect(metadata.screenshots).toEqual(['/images/test-1.png', '/images/test-2.png']);
  });

  it('본문 컨텐츠를 반환한다', () => {
    const { content } = parseMarkdown(SAMPLE_MD);
    expect(content.trim()).toBe('본문 내용');
  });

  it('markdownToHtml: 마크다운을 HTML로 변환한다', () => {
    const html = markdownToHtml('**bold**');
    expect(html).toContain('<strong>bold</strong>');
  });
});
