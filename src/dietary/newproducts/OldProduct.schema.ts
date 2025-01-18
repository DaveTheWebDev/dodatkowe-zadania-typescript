import { relations } from 'drizzle-orm';
import { pgSchema, uuid, numeric, integer } from 'drizzle-orm/pg-core';
import {
  OldProductDescriptionEntity,
  oldProductDescriptions,
} from './OldProductDescription.schema';

const product = pgSchema('product');

export const oldProducts = product.table('old_products', {
  serialNumber: uuid('serial_number').primaryKey().defaultRandom(),
  price: numeric('price', { precision: 19, scale: 4 }),
  counter: integer('counter'),
});

export const oldProductsRelations = relations(oldProducts, ({ one }) => ({
  description: one(oldProductDescriptions, {
    fields: [oldProducts.serialNumber],
    references: [oldProductDescriptions.productSerialNumber],
  }),
}));

export type OldProductEntity = typeof oldProducts.$inferSelect & {
  description?: OldProductDescriptionEntity;
};
