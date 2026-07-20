export type CourseSection = {
  id: string;
  title: string;
  summary: string;
  startPage: number;
  endPage: number;
  evidencePages: number[];
};

export type CourseManifest = {
  schemaVersion: 1;
  courseId: string;
  title: string;
  source: { fileName: string; sha256: string; pageCount: number };
  sections: CourseSection[];
  checkpoints: number[];
  branding: { name: string; accent: string };
};

export function safeCourseId(value: unknown): string;
export function createFallbackManifest(input: { courseId: string; title: string; fileName: string; sha256: string; pageCount: number }): CourseManifest;
export function validateManifest(manifest: unknown): { ok: boolean; errors: string[] };
export function assertManifest<T = CourseManifest>(manifest: T): T;
export function parseManifest(text: string): CourseManifest;
export function sectionForPage(manifest: CourseManifest, page: number): CourseSection;
