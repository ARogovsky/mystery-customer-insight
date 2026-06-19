CREATE TYPE "public"."platform" AS ENUM('ios', 'android', 'web', 'other');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('text', 'rating', 'boolean', 'choice');--> statement-breakpoint
CREATE TYPE "public"."report_target" AS ENUM('app', 'test', 'submission', 'review');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('developer', 'tester');--> statement-breakpoint
CREATE TYPE "public"."test_status" AS ENUM('draft', 'open', 'closed');--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"developer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"app_url" text NOT NULL,
	"platforms" "platform"[] NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"role" "role" NOT NULL,
	"display_name" text,
	"locale" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "report_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"details" text NOT NULL,
	"reporter_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"body" text NOT NULL,
	"rating" integer,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_text" text,
	"answer_value" jsonb
);
--> statement-breakpoint
CREATE TABLE "test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"prompt" text NOT NULL,
	"type" "question_type" NOT NULL,
	"options" jsonb
);
--> statement-breakpoint
CREATE TABLE "test_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"tester_id" uuid NOT NULL,
	"free_text" text,
	"link_url" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tester_rating_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"developer_id" uuid NOT NULL,
	"tester_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tester_stats" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"rating_points" integer DEFAULT 0 NOT NULL,
	"tests_completed" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"title" text NOT NULL,
	"scenario" text NOT NULL,
	"platforms" "platform"[] NOT NULL,
	"starts_at" date,
	"ends_at" date,
	"status" "test_status" DEFAULT 'open' NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_developer_id_profiles_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_submission_id_test_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."test_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_question_id_test_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."test_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_submissions" ADD CONSTRAINT "test_submissions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_submissions" ADD CONSTRAINT "test_submissions_tester_id_profiles_id_fk" FOREIGN KEY ("tester_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_rating_events" ADD CONSTRAINT "tester_rating_events_submission_id_test_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."test_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_rating_events" ADD CONSTRAINT "tester_rating_events_developer_id_profiles_id_fk" FOREIGN KEY ("developer_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_rating_events" ADD CONSTRAINT "tester_rating_events_tester_id_profiles_id_fk" FOREIGN KEY ("tester_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_stats" ADD CONSTRAINT "tester_stats_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apps_developer_id_idx" ON "apps" USING btree ("developer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_clerk_user_id_uq" ON "profiles" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "reports_target_idx" ON "reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "reviews_app_id_idx" ON "reviews" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "submission_answers_submission_id_idx" ON "submission_answers" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "test_questions_test_id_position_idx" ON "test_questions" USING btree ("test_id","position");--> statement-breakpoint
CREATE INDEX "test_submissions_test_id_idx" ON "test_submissions" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "test_submissions_tester_id_idx" ON "test_submissions" USING btree ("tester_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tester_rating_events_submission_uq" ON "tester_rating_events" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "tests_app_id_idx" ON "tests" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "tests_status_idx" ON "tests" USING btree ("status");