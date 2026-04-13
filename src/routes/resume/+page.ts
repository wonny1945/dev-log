import type { PageLoad } from "./$types";
import resumeData from "$lib/data/resume.json";

export const prerender = true;

export const load: PageLoad = () => {
  return { resume: resumeData };
};
