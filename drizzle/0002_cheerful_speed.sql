CREATE TABLE "assignIssues" (
	"id" varchar(256),
	"Contributor" json,
	"image_url" varchar(256)
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "AI Description" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "maintainers" json;