import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// mdsvex 설정을 여기서 바로 정의합니다.
const mdsvexConfig = {
  extensions: ['.svx', '.md'],
  smartypants: {
    dashes: 'oldschool'
  },
  remarkPlugins: [], // 원하는 Remark 플러그인을 여기에 추가
  rehypePlugins: []  // 원하는 Rehype 플러그인을 여기에 추가
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  preprocess: [
    vitePreprocess(),
    mdsvex(mdsvexConfig),
  ],
  kit: {
    adapter: adapter({
      fallback: '404.html'
    }),

    files: {
      assets: 'static'
    },

    paths: {
      base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
    },

    prerender: {
      handleMissingId: 'fail',
      entries: ['*'],
      crawl: true
    }
  }
};

export default config;
