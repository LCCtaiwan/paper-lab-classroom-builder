import { and, desc, eq, inArray } from "drizzle-orm";
import { ensureSchema, getDb } from "../db";
import { courseSessions, courses, questions, reactions } from "../db/schema";
import { parseManifest, sectionForPage, type CourseManifest } from "./course-manifest.mjs";
import { bearerToken, tokenMatches } from "./security";

export async function findCourse(courseId: string) {
  await ensureSchema();
  const [course] = await getDb().select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return course ? { ...course, manifest: parseManifest(course.manifestJson) } : null;
}

export async function requireCourseAdmin(request: Request, courseId: string) {
  const course = await findCourse(courseId);
  if (!course) throw new Response(JSON.stringify({ error: "找不到課程" }), { status: 404, headers: { "content-type": "application/json" } });
  if (!(await tokenMatches(bearerToken(request), course.adminTokenHash))) {
    throw new Response(JSON.stringify({ error: "課程管理權限失效" }), { status: 403, headers: { "content-type": "application/json" } });
  }
  return course;
}

export async function findSession(code: string) {
  await ensureSchema();
  const [session] = await getDb().select().from(courseSessions).where(eq(courseSessions.code, code.toUpperCase())).limit(1);
  if (!session) return null;
  const course = await findCourse(session.courseId);
  return course ? { session, course } : null;
}

export async function requireSessionHost(request: Request, code: string) {
  const found = await findSession(code);
  if (!found) throw new Response(JSON.stringify({ error: "找不到課堂代碼" }), { status: 404, headers: { "content-type": "application/json" } });
  if (!(await tokenMatches(bearerToken(request), found.session.hostTokenHash))) {
    throw new Response(JSON.stringify({ error: "講師權限失效" }), { status: 403, headers: { "content-type": "application/json" } });
  }
  return found;
}

export async function sessionSnapshot(code: string, includeHidden = false) {
  const found = await findSession(code);
  if (!found) return null;
  const db = getDb();
  const visibleQuestions = await db.select().from(questions)
    .where(includeHidden ? eq(questions.sessionId, found.session.id) : and(eq(questions.sessionId, found.session.id), eq(questions.hidden, false)))
    .orderBy(desc(questions.id)).limit(100);
  const ids = visibleQuestions.map((question) => question.id);
  const voteRows = ids.length ? await db.select().from(reactions).where(inArray(reactions.questionId, ids)) : [];
  const votes = new Map<number, number>();
  voteRows.forEach((reaction) => votes.set(reaction.questionId, (votes.get(reaction.questionId) ?? 0) + 1));
  const manifest = found.course.manifest as CourseManifest;
  const activeSection = sectionForPage(manifest, found.session.currentPage);
  return {
    course: { id: found.course.id, title: found.course.title, manifest },
    session: {
      code: found.session.code,
      currentPage: found.session.currentPage,
      currentSectionId: activeSection.id,
      featuredQuestionId: found.session.featuredQuestionId,
      status: found.session.status,
      createdAt: found.session.createdAt,
      endedAt: found.session.endedAt,
    },
    questions: visibleQuestions.map((question) => ({ ...question, votes: votes.get(question.id) ?? 0 })).reverse(),
  };
}
