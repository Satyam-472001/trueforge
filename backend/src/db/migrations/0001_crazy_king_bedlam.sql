CREATE TABLE "issues" (
	"id" bigint PRIMARY KEY NOT NULL,
	"repository_id" bigint NOT NULL,
	"installation_id" bigint,
	"number" bigint NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"state" text NOT NULL,
	"author" text,
	"html_url" text NOT NULL,
	"labels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"github_created_at" timestamp with time zone,
	"github_updated_at" timestamp with time zone,
	"github_closed_at" timestamp with time zone,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL
);
