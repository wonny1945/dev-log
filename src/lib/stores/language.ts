import { writable } from "svelte/store";

export type Lang = "ko" | "en";
export const lang = writable<Lang>("ko");

export function toggleLang(): void {
  lang.update((l) => (l === "ko" ? "en" : "ko"));
}
