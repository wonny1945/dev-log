import { get } from 'svelte/store';
import { lang, toggleLang } from './language';

describe('language store', () => {
  beforeEach(() => {
    lang.set('ko');
  });

  it('기본값은 ko', () => {
    expect(get(lang)).toBe('ko');
  });

  it('toggleLang: ko → en', () => {
    toggleLang();
    expect(get(lang)).toBe('en');
  });

  it('toggleLang: en → ko', () => {
    lang.set('en');
    toggleLang();
    expect(get(lang)).toBe('ko');
  });
});
