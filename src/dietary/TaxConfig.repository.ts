import { TaxConfig } from './TaxConfig';
import { TaxRule } from './TaxRule';
import { eq, SQL } from 'drizzle-orm';
import * as taxConfigSchema from './TaxConfig.schema';
import * as taxRuleSchema from './TaxRule.schema';
import { TaxRuleEntity } from './TaxRule.schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { upsert } from '@storage';

export interface TaxConfigRepository {
  findAll(): Promise<TaxConfig[]>;
  findById(id: number): Promise<TaxConfig | null>;
  save(taxConfig: TaxConfig): Promise<TaxConfig>;
  findByCountryCode(countryCode: string): Promise<TaxConfig | null>;
}

export class DrizzleTaxConfigRepository implements TaxConfigRepository {
  constructor(
    private db: NodePgDatabase<typeof taxConfigSchema & typeof taxRuleSchema>,
  ) {}

  async findAll(where?: SQL<unknown>): Promise<TaxConfig[]> {
    const entities = await this.db.query.taxConfigs.findMany({
      with: { taxRules: true },
      where,
    });
    return entities.map(TaxConfig.mapFromEntity);
  }

  async findById(id: number): Promise<TaxConfig | null> {
    const result = await this.db.query.taxConfigs.findFirst({
      where: eq(taxConfigSchema.taxConfigs.id, id),
      with: { taxRules: true },
    });

    return result ? TaxConfig.mapFromEntity(result) : null;
  }

  async save(taxConfig: TaxConfig): Promise<TaxConfig> {
    return await this.db.transaction(async (trx) => {
      const entity = taxConfig.mapToEntity();
      const { id, version, ...toUpdate } = entity;

      const savedTaxConfig = await upsert(
        entity,
        toUpdate,
        {
          id: [taxConfigSchema.taxConfigs.id, id],
          version: [taxConfigSchema.taxConfigs.version, version],
        },
        trx,
      );

      const taxRules: TaxRuleEntity[] = [];
      for (const taxRule of taxConfig.getTaxRules()) {
        const entity = mapFromTaxRule(taxRule, savedTaxConfig.id);
        const { id, version, ...toUpdate } = entity;

        const savedTaxRule = await upsert(
          entity,
          toUpdate,
          {
            id: [taxRuleSchema.taxRules.id, id],
            version: [taxRuleSchema.taxRules.version, version],
          },
          trx,
        );
        taxRules.push(savedTaxRule);
      }

      const mappedTaxConfig = TaxConfig.mapFromEntity({
        ...savedTaxConfig,
        taxRules,
        lastModifiedDate: new Date(
          savedTaxConfig.lastModifiedDate as unknown as string | number,
        ),
      });

      return mappedTaxConfig;
    });
  }

  async findByCountryCode(countryCode: string): Promise<TaxConfig | null> {
    const result = await this.db.query.taxConfigs.findFirst({
      where: eq(taxConfigSchema.taxConfigs.countryCode, countryCode),
      with: { taxRules: true },
    });

    return result ? TaxConfig.mapFromEntity(result) : null;
  }
}

const mapFromTaxRule = (rule: TaxRule, taxConfigId: number): TaxRuleEntity => {
  return {
    id: rule.getId(),
    version: rule.getVersion() ?? 1,
    taxCode: rule.getTaxCode(),
    isLinear: rule.getIsLinear(),
    aFactor: rule.getAFactor(),
    bFactor: rule.getBFactor(),
    isSquare: rule.getIsSquare(),
    aSquareFactor: rule.getASquareFactor(),
    bSquareFactor: rule.getBSquareFactor(),
    cSquareFactor: rule.getCSquareFactor(),
    taxConfigId,
  };
};
