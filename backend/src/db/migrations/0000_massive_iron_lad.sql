CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"installation_id" bigint,
	"repository_id" bigint,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"finding_id" uuid NOT NULL,
	"github_user" text,
	"reaction" text,
	"meaning" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pull_request_id" bigint NOT NULL,
	"github_comment_id" bigint,
	"title" text NOT NULL,
	"type" text,
	"severity" text,
	"confidence" text,
	"file" text,
	"status" text DEFAULT 'open',
	"explanation" text,
	"suggestion" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "installations" (
	"id" bigint PRIMARY KEY NOT NULL,
	"account_login" text NOT NULL,
	"account_type" text,
	"sender_login" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" bigint PRIMARY KEY NOT NULL,
	"installation_id" bigint NOT NULL,
	"full_name" text NOT NULL,
	"owner" text,
	"name" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" bigint PRIMARY KEY NOT NULL,
	"repository_id" bigint NOT NULL,
	"github_pr_id" bigint NOT NULL,
	"pr_number" bigint NOT NULL,
	"title" text,
	"author" text,
	"risk_level" text,
	"summary" text,
	"created_at" timestamp DEFAULT now()
);
