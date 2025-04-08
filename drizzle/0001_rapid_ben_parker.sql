CREATE TABLE "projects" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"ProjectOwner" varchar(256),
	"Short Description" text,
	"Long Description" text,
	"image_url" varchar(256),
	"Repository" varchar(256),
	"issues" varchar(256)
);
