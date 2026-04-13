import { sortByDuration, filterProjects } from './utils';
import type { Project } from '$lib/parseMarkdown';

const makeProject = (duration: string, type: 'work' | 'side'): Project => ({
	title_ko: '테스트',
	title_en: 'Test',
	type,
	duration,
	overview_ko: '',
	overview_en: '',
	role_ko: '',
	role_en: '',
	tech: '',
	thumbnail: '',
	screenshots: [],
	techList: [],
	content: ''
});

describe('sortByDuration', () => {
	it('종료일 기준 내림차순 정렬', () => {
		const projects = [
			makeProject('2021.03 ~ 2021.06', 'work'),
			makeProject('2024.06 ~', 'work'),
			makeProject('2022.01 ~ 2022.03', 'work')
		];
		const sorted = sortByDuration(projects);
		expect(sorted[0].duration).toBe('2024.06 ~');
		expect(sorted[1].duration).toBe('2022.01 ~ 2022.03');
		expect(sorted[2].duration).toBe('2021.03 ~ 2021.06');
	});
});

describe('filterProjects', () => {
	const projects = [
		makeProject('2022.01 ~ 2022.03', 'work'),
		makeProject('2023.01 ~', 'side')
	];

	it('all: 전체 반환', () => {
		expect(filterProjects(projects, 'all')).toHaveLength(2);
	});

	it('work: work만 반환', () => {
		const result = filterProjects(projects, 'work');
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('work');
	});

	it('side: side만 반환', () => {
		const result = filterProjects(projects, 'side');
		expect(result).toHaveLength(1);
		expect(result[0].type).toBe('side');
	});
});
