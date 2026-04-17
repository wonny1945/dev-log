import { describe, it, expect } from 'vitest';
import { groupByYear } from './utils';
import type { Project } from '$lib/parseMarkdown';

function makeProject(duration: string, title = 'P'): Project {
  return {
    title_ko: title, title_en: title, category: '개발', tags: '개발',
    duration, overview_ko: '', overview_en: '', role_ko: '', role_en: '',
    tech: '', achievement: '', thumbnail: '', screenshots: [],
    techList: [], tagList: [], content: ''
  };
}

describe('groupByYear', () => {
  it('groups projects by start year, descending', () => {
    const projects = [
      makeProject('2021.01 ~ 2021.06'),
      makeProject('2023 ~ 2025'),
      makeProject('2026 ~'),
    ];
    const groups = groupByYear(projects);
    expect(groups.map(g => g.year)).toEqual(['2026', '2023', '2021']);
  });

  it('puts multiple projects of same year in one group', () => {
    const projects = [
      makeProject('2026 ~', 'A'),
      makeProject('2026 ~', 'B'),
    ];
    const groups = groupByYear(projects);
    expect(groups).toHaveLength(1);
    expect(groups[0].projects).toHaveLength(2);
  });
});
