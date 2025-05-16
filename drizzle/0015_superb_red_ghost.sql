CREATE TABLE "messages" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"from_id" varchar(256),
	"to_id" varchar(256),
	"date" timestamp with time zone,
	"chat_data" json
);
