import { TestConfiguration } from '../../config';
import * as schema from '@schemas';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  DrizzleOldProductRepository,
  OldProductRepository,
} from '@dietary/newproducts/OldProduct.repository';
import { UUID } from '@utils/uuid';
import { OldProduct } from '@dietary/newproducts/OldProduct';

describe('OldProductRepository', () => {
  const testEnvironment = TestConfiguration();

  let oldProductRepository: OldProductRepository;
  let db: NodePgDatabase<typeof schema>;

  beforeAll(async () => {
    db = await testEnvironment.start({ schema });
    oldProductRepository = new DrizzleOldProductRepository(db);
  }, 30000);

  afterAll(async () => {
    await testEnvironment.stop();
  });

  describe('findBySerialNumber', () => {
    it('should return an OldProduct with description when it exists', async () => {
      // Given
      const serialNumber = UUID.randomUUID();
      const price = '10.5000';
      const counter = 10;
      const shortDesc = 'shortDesc';
      const longDesc = 'longDesc';

      await db
        .insert(schema.oldProducts)
        .values({
          serialNumber,
          counter,
          price,
        })
        .execute();

      await db
        .insert(schema.oldProductDescriptions)
        .values({
          productSerialNumber: serialNumber,
          shortDesc,
          longDesc,
        })
        .execute();

      // When
      const product = await oldProductRepository.findBySerialNumber(
        UUID.from(serialNumber),
      );

      // Then
      expect(product).toBeInstanceOf(OldProduct);
      expect(product?.priceAmount).toBe(Number(price));
      expect(product?.counterNumber).toBe(counter);
      expect(product?.description).toBe(`${shortDesc} *** ${longDesc}`);
    });

    it("should return null when the product doesn't exist", async () => {
      // Given
      const nonExistentSerialNumber = UUID.randomUUID();

      // When
      const product = await oldProductRepository.findBySerialNumber(
        UUID.from(nonExistentSerialNumber),
      );

      // Then
      expect(product).toBeNull();
    });

    it("should return a product with empty description when description doesn't exist", async () => {
      // Given
      const serialNumber = UUID.randomUUID();
      const price = '15.7500';
      const counter = 5;

      await db
        .insert(schema.oldProducts)
        .values({
          serialNumber,
          counter,
          price,
        })
        .execute();

      // When
      const product = await oldProductRepository.findBySerialNumber(
        UUID.from(serialNumber),
      );

      // Then
      expect(product).toBeInstanceOf(OldProduct);
      expect(product?.priceAmount).toBe(Number(price));
      expect(product?.counterNumber).toBe(counter);
      expect(product?.description).toBe('');
    });
  });

  describe('findAll', () => {
    it('should return all OldProducts with their descriptions', async () => {
      // Given
      await db.delete(schema.oldProductDescriptions).execute();
      await db.delete(schema.oldProducts).execute();

      const products = [
        {
          serialNumber: UUID.randomUUID(),
          price: '10.0000',
          counter: 1,
          shortDesc: 'Short1',
          longDesc: 'Long1',
        },
        {
          serialNumber: UUID.randomUUID(),
          price: '20.0000',
          counter: 2,
          shortDesc: 'Short2',
          longDesc: 'Long2',
        },
      ];

      for (const product of products) {
        await db
          .insert(schema.oldProducts)
          .values({
            serialNumber: product.serialNumber,
            price: product.price,
            counter: product.counter,
          })
          .execute();

        await db
          .insert(schema.oldProductDescriptions)
          .values({
            productSerialNumber: product.serialNumber,
            shortDesc: product.shortDesc,
            longDesc: product.longDesc,
          })
          .execute();
      }

      // When
      const result = await oldProductRepository.findAll();

      // Then
      expect(result).toHaveLength(products.length);
      result.forEach((product, index) => {
        expect(product).toBeInstanceOf(OldProduct);
        expect(product.priceAmount).toBe(Number(products[index].price));
        expect(product.counterNumber).toBe(products[index].counter);
        expect(product.description).toBe(
          `${products[index].shortDesc} *** ${products[index].longDesc}`,
        );
      });
    });
  });
});
