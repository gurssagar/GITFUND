ALTER TABLE "assignIssues" ADD COLUMN "projectName" varchar(256);--> statement-breakpoint
ALTER TABLE "assignIssues" ADD COLUMN "issue" varchar(256);--> statement-breakpoint
ALTER TABLE "assignIssues" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "assignIssues" DROP COLUMN "image_url";