CREATE TABLE IF NOT EXISTS "pizza" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" real,
	"enabled" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial NOT NULL,
	"name" text,
	"email" text,
	"password" text,
	"role" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
