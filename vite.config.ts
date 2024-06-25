import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    assetsInclude: ['**/*.md'], // 이 줄을 추가합니다.
    server: {
        fs: {
            allow: ['..'] // 이 줄을 추가하여 상위 디렉토리 접근을 허용합니다.
        }
    }
});