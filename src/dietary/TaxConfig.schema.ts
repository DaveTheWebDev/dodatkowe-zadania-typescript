import { bigserial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { taxRules } from './TaxRule.schema';
import { pgSchema } from 'drizzle-orm/pg-core';

const tax = pgSchema('tax');

export const taxConfigs = tax.table('tax_configs', {
  id: bigserial('tax_config_id', { mode: 'number' }).primaryKey(),
  version: bigserial('version', { mode: 'number' }).notNull(),
  description: text('description').notNull(),
  countryReason: text('country_reason').notNull(),
  countryCode: text('country_code').notNull(),
  lastModifiedDate: timestamp('last_modified_date', { mode: 'date' }).notNull(),
  currentRulesCount: integer('current_rules_count').notNull(),
  maxRulesCount: integer('max_rules_count').notNull(),
});

export const taxConfigsRelations = relations(taxConfigs, ({ many }) => ({
  taxRules: many(taxRules),
}));

export type TaxConfigEntity = typeof taxConfigs.$inferSelect;
export type TaxConfigEntityWithRules = TaxConfigEntity & {
  taxRules: (typeof taxRules.$inferSelect)[];
};
