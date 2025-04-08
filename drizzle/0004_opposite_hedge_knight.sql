ALTER TABLE "assignIssues" ALTER COLUMN "Contributor" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "assignIssues" ADD COLUMN "image_url" varchar(256);--> statement-breakpoint
ALTER TABLE "assignIssues" ADD COLUMN "name" varchar(256);--> statement-breakpoint
ALTER TABLE "assignIssues" ADD COLUMN "description" text;