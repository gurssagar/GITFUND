ALTER TABLE "projects" ADD COLUMN "rewardAmount" varchar(256);--> statement-breakpoint
ALTER TABLE "assignIssues" DROP COLUMN "rewardAmount";