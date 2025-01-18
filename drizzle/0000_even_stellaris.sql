CREATE SCHEMA IF NOT EXISTS "tax";

CREATE TABLE "tax"."tax_configs" (
	"tax_config_id" bigserial PRIMARY KEY NOT NULL,
	"version" bigserial NOT NULL,
	"description" text NOT NULL,
	"country_reason" text NOT NULL,
	"country_code" text NOT NULL,
	"last_modified_date" timestamp NOT NULL,
	"current_rules_count" integer NOT NULL,
	"max_rules_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax"."tax_rules" (
	"tax_rule_id" bigserial PRIMARY KEY NOT NULL,
	"version" bigserial NOT NULL,
	"tax_config_id" bigint NOT NULL,
	"is_linear" boolean DEFAULT false,
	"a_factor" integer,
	"b_factor" integer,
	"is_square" boolean DEFAULT false,
	"a_square_factor" integer,
	"b_square_factor" integer,
	"c_square_factor" integer,
	"tax_code" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tax"."tax_rules" ADD CONSTRAINT "tax_rules_tax_config_id_tax_configs_tax_config_id_fk" FOREIGN KEY ("tax_config_id") REFERENCES "tax"."tax_configs"("tax_config_id") ON DELETE no action ON UPDATE no action;