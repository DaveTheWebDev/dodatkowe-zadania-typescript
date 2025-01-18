import { TaxRule } from './TaxRule';
import * as schema from './TaxRule.schema';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface TaxRuleRepository {
  findById(id: number): Promise<TaxRule>;
  delete(taxRule: TaxRule): Promise<void>;
}

export class DrizzleTaxRuleRepository implements TaxRuleRepository {
  constructor(private db: NodePgDatabase<typeof schema>) {}

  async findById(id: number): Promise<TaxRule> {
    const result = await this.db.query.taxRules.findFirst({
      where: eq(schema.taxRules.id, id),
    });

    if (!result) throw new Error(`TaxRule with id ${id} not found`);

    return TaxRule.mapFromEntity(result);
  }

  async delete(taxRule: TaxRule): Promise<void> {
    const taxRuleId = taxRule.getId();
    if (taxRuleId === null) {
      throw new Error('TaxRule ID cannot be null');
    }
    await this.db
      .delete(schema.taxRules)
      .where(eq(schema.taxRules.id, taxRuleId));
  }
}
