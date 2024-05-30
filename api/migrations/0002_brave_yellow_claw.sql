CREATE TABLE IF NOT EXISTS "auth_bearer_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userid" integer NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp DEFAULT now() + interval '8 hours' NOT NULL,
	CONSTRAINT "auth_bearer_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "user" ADD PRIMARY KEY ("id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_bearer_tokens" ADD CONSTRAINT "auth_bearer_tokens_userid_user_id_fk" FOREIGN KEY ("userid") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
