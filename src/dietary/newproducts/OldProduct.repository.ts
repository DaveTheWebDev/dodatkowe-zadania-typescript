import { OldProduct } from '@dietary/newproducts/OldProduct';
import { eq, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './OldProduct.schema';

export interface OldProductRepository {
  findAll(): Promise<OldProduct[]>;
  findBySerialNumber(
    serialNumber: OldProduct['serialNumber'],
  ): Promise<OldProduct | null>;
}

export class DrizzleOldProductRepository implements OldProductRepository {
  constructor(private db: NodePgDatabase<typeof schema>) {}

  async findAll(where?: SQL<unknown>): Promise<OldProduct[]> {
    const entities = (await this.db.query.oldProducts.findMany({
      where,
      with: {
        description: {
          columns: {
            shortDesc: true,
            longDesc: true,
          },
        },
      },
    })) as schema.OldProductEntity[];
    return Promise.all(entities.map((entity) => this.mapToOldProduct(entity)));
  }

  async findBySerialNumber(
    serialNumber: OldProduct['serialNumber'],
  ): Promise<OldProduct | null> {
    const result = (await this.db.query.oldProducts.findFirst({
      where: eq(schema.oldProducts.serialNumber, serialNumber),
      with: {
        description: {
          columns: {
            shortDesc: true,
            longDesc: true,
          },
        },
      },
    })) as schema.OldProductEntity | undefined;

    return result ? this.mapToOldProduct(result) : null;
  }

  private mapToOldProduct(entity: schema.OldProductEntity): OldProduct {
    return new OldProduct(
      entity.price ? Number(entity.price) : null,
      entity.description?.shortDesc ?? '',
      entity.description?.longDesc ?? '',
      entity.counter !== null ? entity.counter : null,
    );
  }
}
