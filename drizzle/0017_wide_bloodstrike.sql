CREATE TABLE "project" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"AI Description" text,
	"ProjectOwner" varchar(256),
	"Short Description" text,
	"Long Description" text,
	"image_url" varchar(256),
	"Repository" varchar(256),
	"maintainers" json,
	"languages" json,
	"stars" varchar,
	"forks" varchar
);
--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "Difficulty";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "priority";