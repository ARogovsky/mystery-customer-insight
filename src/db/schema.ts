import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ===== Enums =====
export const roleEnum = pgEnum("role", ["developer", "tester"]);
export const platformEnum = pgEnum("platform", ["ios", "android", "web", "other"]);
export const testStatusEnum = pgEnum("test_status", ["draft", "open", "closed"]);
export const questionTypeEnum = pgEnum("question_type", [
  "text",
  "rating",
  "boolean",
  "choice",
]);
export const reportTargetEnum = pgEnum("report_target", [
  "app",
  "test",
  "submission",
  "review",
]);

// ===== profiles — зеркало пользователя Clerk =====
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    role: roleEnum("role").notNull(),
    displayName: text("display_name"),
    locale: text("locale").notNull().default("en"), // en | uk | ru
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("profiles_clerk_user_id_uq").on(t.clerkUserId)],
);

// ===== tester_stats — агрегат рейтинга тестера (decoupled от тестов) =====
export const testerStats = pgTable("tester_stats", {
  profileId: uuid("profile_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  ratingPoints: integer("rating_points").notNull().default(0),
  testsCompleted: integer("tests_completed").notNull().default(0),
});

// ===== apps (PUBLIC) =====
export const apps = pgTable(
  "apps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    developerId: uuid("developer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    appUrl: text("app_url").notNull(), // ссылка вместо загрузки файла
    platforms: platformEnum("platforms").array().notNull(),
    isHidden: boolean("is_hidden").notNull().default(false),
    reportCount: integer("report_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("apps_developer_id_idx").on(t.developerId)],
);

// ===== tests (кампании; PUBLIC) =====
export const tests = pgTable(
  "tests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    scenario: text("scenario").notNull(), // задачи для тестера
    platforms: platformEnum("platforms").array().notNull(),
    startsAt: date("starts_at"),
    endsAt: date("ends_at"),
    status: testStatusEnum("status").notNull().default("open"),
    isHidden: boolean("is_hidden").notNull().default(false),
    reportCount: integer("report_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tests_app_id_idx").on(t.appId), index("tests_status_idx").on(t.status)],
);

// ===== test_questions =====
export const testQuestions = pgTable(
  "test_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testId: uuid("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    prompt: text("prompt").notNull(),
    type: questionTypeEnum("type").notNull(),
    options: jsonb("options"), // варианты для type = choice
  },
  (t) => [index("test_questions_test_id_position_idx").on(t.testId, t.position)],
);

// ===== test_submissions (результаты; PUBLIC) =====
export const testSubmissions = pgTable(
  "test_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    testId: uuid("test_id")
      .notNull()
      .references(() => tests.id, { onDelete: "cascade" }),
    // внутренняя связь; в публичном UI тестер обезличен
    testerId: uuid("tester_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    freeText: text("free_text"),
    linkUrl: text("link_url"), // вложение ссылкой
    isHidden: boolean("is_hidden").notNull().default(false),
    reportCount: integer("report_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("test_submissions_test_id_idx").on(t.testId),
    index("test_submissions_tester_id_idx").on(t.testerId),
  ],
);

// ===== submission_answers =====
export const submissionAnswers = pgTable(
  "submission_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => testSubmissions.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => testQuestions.id, { onDelete: "cascade" }),
    answerText: text("answer_text"),
    answerValue: jsonb("answer_value"), // для rating/boolean/choice
  },
  (t) => [index("submission_answers_submission_id_idx").on(t.submissionId)],
);

// ===== tester_rating_events — «плюс» от разработчика, адресат скрыт в UI =====
export const testerRatingEvents = pgTable(
  "tester_rating_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => testSubmissions.id, { onDelete: "cascade" }),
    developerId: uuid("developer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    testerId: uuid("tester_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // один плюс на сабмишн
  (t) => [uniqueIndex("tester_rating_events_submission_uq").on(t.submissionId)],
);

// ===== reviews — анонимные, публикуются сразу =====
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    rating: integer("rating"), // опционально 1..5
    isHidden: boolean("is_hidden").notNull().default(false),
    reportCount: integer("report_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reviews_app_id_idx").on(t.appId)],
);

// ===== reports — модерация; анонимно, без auth, форма обязательна =====
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetType: reportTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reason: text("reason").notNull(), // обязательное поле формы
    details: text("details").notNull(), // обязательное поле формы
    reporterEmail: text("reporter_email"), // опционально
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reports_target_idx").on(t.targetType, t.targetId)],
);
