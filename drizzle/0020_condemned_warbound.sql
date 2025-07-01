CREATE TABLE "PullRequests" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository" varchar(256),
	"pullRequestId" varchar(256),
	"title" text,
	"description" text,
	"status" varchar(256),
	"createdAt" timestamp DEFAULT now(),
	"rewardedAt" timestamp DEFAULT now(),
	"contributorId" varchar(256),
	"projectName" varchar(256),
	"rewardAmount" double precision,
	"issue" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "contributorRequests" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectName" varchar(256),
	"Contributor" varchar(256),
	"contributor_email" varchar(256),
	"requestDate" varchar(256),
	"projectOwner" varchar(256),
	"skills" json,
	"issue" varchar(256),
	"image_url" varchar(256),
	"name" varchar(256),
	"description" text,
	"status" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	CONSTRAINT "participants_conversation_user_unique" UNIQUE("conversation_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "rewards" RENAME COLUMN "value" TO "rewardAmount";--> statement-breakpoint
ALTER TABLE "rewards" ALTER COLUMN "date" SET DATA TYPE timestamp USING date::timestamp without time zone;--> statement-breakpoint
ALTER TABLE "rewards" ALTER COLUMN "date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "issue_date" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "projectDescription" text;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "projectOwner" varchar(256);--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "project_repository" varchar(256);--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "transactionHash" varchar(256);--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "id" varchar(256) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "publisher" varchar(256);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "text" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "timestamp" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reciever_id" varchar(256);--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "sender_id" varchar(256);--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "likes" integer;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "owner" json;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "language" json;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "comits" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "rating" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "skills" json;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "from_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "to_id";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "chat_data";