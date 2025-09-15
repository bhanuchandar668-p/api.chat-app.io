ALTER TABLE "users" ADD COLUMN "profile_url" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_seen" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "about" varchar;