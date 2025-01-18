import {
  bigint,
  bigserial,
  boolean,
  integer,
  pgSchema,
  text,
} from 'drizzle-orm/pg-core';
import { taxConfigs } from './TaxConfig.schema';
import { relations } from 'drizzle-orm';

const tax = pgSchema('tax');

export const taxRules = tax.table('tax_rules', {
  id: bigserial('tax_rule_id', { mode: 'number' }).primaryKey(),
  version: bigserial('version', { mode: 'number' }).notNull(),
  taxConfigId: bigint('tax_config_id', { mode: 'number' })
    .references(() => taxConfigs.id)
    .notNull(),
  isLinear: boolean('is_linear').default(false),
  aFactor: integer('a_factor'),
  bFactor: integer('b_factor'),
  isSquare: boolean('is_square').default(false),
  aSquareFactor: integer('a_square_factor'),
  bSquareFactor: integer('b_square_factor'),
  cSquareFactor: integer('c_square_factor'),
  taxCode: text('tax_code').notNull(),
});

export const taxRulesRelations = relations(taxRules, ({ one }) => ({
  taxConfig: one(taxConfigs, {
    fields: [taxRules.taxConfigId],
    references: [taxConfigs.id],
  }),
}));

export type TaxRuleEntity = typeof taxRules.$inferSelect;
