import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  assetsInclude: ["**/*.md"],
  server: {
    fs: {
      allow: [".."],
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
  },
});
