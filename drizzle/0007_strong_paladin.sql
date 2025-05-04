CREATE TABLE "assignedIssues" (
	"projectName" varchar(256),
	"Contributor" varchar(256),
	"issue" varchar(256),
	"image_url" varchar(256),
	"name" varchar(256),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "pendingReview" (
	"projectName" varchar(256),
	"Contributor" varchar(256),
	"issue" varchar(256),
	"image_url" varchar(256),
	"name" varchar(256),
	"description" text
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "Difficulty" varchar(256);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "priority" varchar(256);