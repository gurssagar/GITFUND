ALTER TABLE "issues" ADD COLUMN "issue_name" varchar(256);--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "issue_description" text;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "issue_date" timestamp with time zone;