CREATE TYPE "public"."shoutbox_moderation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "shoutbox_messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shoutbox_messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" "shoutbox_moderation_status" DEFAULT 'pending' NOT NULL,
	"content" text NOT NULL,
	"reply" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
