ALTER TABLE "open_order" RENAME COLUMN "order" TO "paidorder";--> statement-breakpoint
ALTER TABLE "paid_order" RENAME COLUMN "order" TO "waitingorder";--> statement-breakpoint
ALTER TABLE "waiting_order" RENAME COLUMN "order" TO "collectedorder";--> statement-breakpoint
ALTER TABLE "open_order" DROP CONSTRAINT "open_order_order_paid_order_id_fk";
--> statement-breakpoint
ALTER TABLE "paid_order" DROP CONSTRAINT "paid_order_order_waiting_order_id_fk";
--> statement-breakpoint
ALTER TABLE "waiting_order" DROP CONSTRAINT "waiting_order_order_collected_order_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "open_order" ADD CONSTRAINT "open_order_paidorder_paid_order_id_fk" FOREIGN KEY ("paidorder") REFERENCES "public"."paid_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paid_order" ADD CONSTRAINT "paid_order_waitingorder_waiting_order_id_fk" FOREIGN KEY ("waitingorder") REFERENCES "public"."waiting_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waiting_order" ADD CONSTRAINT "waiting_order_collectedorder_collected_order_id_fk" FOREIGN KEY ("collectedorder") REFERENCES "public"."collected_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
