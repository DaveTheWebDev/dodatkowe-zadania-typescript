CREATE TABLE "product"."old_product_descriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_serial_number" uuid NOT NULL,
	"short_desc" varchar,
	"long_desc" text
);
--> statement-breakpoint
ALTER TABLE "product"."old_product_descriptions" ADD CONSTRAINT "old_product_descriptions_product_serial_number_old_products_serial_number_fk" FOREIGN KEY ("product_serial_number") REFERENCES "product"."old_products"("serial_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product"."old_products" DROP COLUMN "desc";--> statement-breakpoint
ALTER TABLE "product"."old_products" DROP COLUMN "long_desc";