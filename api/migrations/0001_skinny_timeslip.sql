DO $$ BEGIN
 CREATE TYPE "public"."orderState" AS ENUM('open', 'paid', 'delivered');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collected_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "open_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paid_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"paymentid" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pizza_order_map" (
	"orderid" integer,
	"pizza" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waiting_order" (
	"id" serial PRIMARY KEY NOT NULL,
	"order" integer NOT NULL,
	"time_left" real,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collected_order" ADD CONSTRAINT "collected_order_order_waiting_order_id_fk" FOREIGN KEY ("order") REFERENCES "public"."waiting_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paid_order" ADD CONSTRAINT "paid_order_order_open_order_id_fk" FOREIGN KEY ("order") REFERENCES "public"."open_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paid_order" ADD CONSTRAINT "paid_order_paymentid_payment_id_fk" FOREIGN KEY ("paymentid") REFERENCES "public"."payment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waiting_order" ADD CONSTRAINT "waiting_order_order_paid_order_id_fk" FOREIGN KEY ("order") REFERENCES "public"."paid_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
