CREATE SCHEMA IF NOT EXISTS "product";

CREATE TABLE "product"."old_products" (
	"serial_number" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price" numeric(19, 4),
	"desc" varchar,
	"long_desc" varchar,
	"counter" integer
);
