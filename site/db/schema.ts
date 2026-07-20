import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  manifestJson: text("manifest_json").notNull(),
  adminTokenHash: text("admin_token_hash").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const courseSessions = sqliteTable("course_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: text("course_id").notNull().references(() => courses.id),
  code: text("code").notNull(),
  hostTokenHash: text("host_token_hash").notNull(),
  currentPage: integer("current_page").notNull().default(1),
  featuredQuestionId: integer("featured_question_id"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  endedAt: text("ended_at"),
}, (table) => [
  uniqueIndex("course_sessions_code_idx").on(table.code),
  index("course_sessions_course_idx").on(table.courseId, table.id),
]);

export const questions = sqliteTable("questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: integer("session_id").notNull().references(() => courseSessions.id),
  nickname: text("nickname").notNull(),
  clientId: text("client_id").notNull(),
  sectionId: text("section_id").notNull(),
  pageNumber: integer("page_number").notNull(),
  body: text("body").notNull(),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("questions_session_idx").on(table.sessionId, table.id)]);

export const reactions = sqliteTable("reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: integer("question_id").notNull().references(() => questions.id),
  clientId: text("client_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("reactions_question_client_idx").on(table.questionId, table.clientId)]);
