import type { CourseManifest } from "./course-manifest.mjs";

export type ClassroomQuestion = {
  id: number;
  nickname: string;
  body: string;
  pageNumber: number;
  sectionId: string;
  hidden: boolean;
  votes: number;
  createdAt: string;
};

export type ClassroomSnapshot = {
  course: { id: string; title: string; manifest: CourseManifest };
  session: { code: string; currentPage: number; currentSectionId: string; featuredQuestionId: number | null; status: string; createdAt: string; endedAt: string | null };
  questions: ClassroomQuestion[];
};
