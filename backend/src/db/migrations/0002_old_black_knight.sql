ALTER TABLE "issues" ADD COLUMN "agent_session_id" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "agent_turn_id" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "agent_status" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "agent_error" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "agent_started_at" timestamp with time zone;