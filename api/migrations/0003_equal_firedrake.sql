ALTER TABLE "collected_order" DROP CONSTRAINT "collected_order_order_waiting_order_id_fk";
--> statement-breakpoint
ALTER TABLE "paid_order" DROP CONSTRAINT "paid_order_order_open_order_id_fk";
--> statement-breakpoint
ALTER TABLE "waiting_order" DROP CONSTRAINT "waiting_order_order_paid_order_id_fk";
--> statement-breakpoint
ALTER TABLE "paid_order" ALTER COLUMN "order" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "waiting_order" ALTER COLUMN "order" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "open_order" ADD COLUMN "order" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_order" ADD CONSTRAINT "open_order_order_paid_order_id_fk" FOREIGN KEY ("order") REFERENCES "public"."paid_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paid_order" ADD CONSTRAINT "paid_order_order_waiting_order_id_fk" FOREIGN KEY ("order") REFERENCES "public"."waiting_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waiting_order" ADD CONSTRAINT "waiting_order_order_collected_order_id_fk" FOREIGN KEY ("order") REFERENCES "public"."collected_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "collected_order" DROP COLUMN IF EXISTS "order";