import { pgSchema, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { oldProducts } from './OldProduct.schema';

const product = pgSchema('product');

export const oldProductDescriptions = product.table(
  'old_product_descriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productSerialNumber: uuid('product_serial_number')
      .references(() => oldProducts.serialNumber)
      .notNull(),
    shortDesc: varchar('short_desc'),
    longDesc: text('long_desc'),
  },
);

export type OldProductDescriptionEntity =
  typeof oldProductDescriptions.$inferSelect;
