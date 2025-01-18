import { TaxConfigEntity, TaxConfigEntityWithRules } from './TaxConfig.schema';
import { TaxRule } from './TaxRule';

export class TaxConfig {
  id: number | null;
  private description: string;
  private countryReason: string;
  private countryCode: string;
  private lastModifiedDate: Date;
  private currentRulesCount: number;
  private maxRulesCount: number;
  private taxRules: TaxRule[];
  private version: number | null;

  private constructor(config: {
    id?: number | null;
    description: string;
    countryReason: string;
    countryCode: string;
    lastModifiedDate: Date;
    currentRulesCount: number;
    maxRulesCount: number;
    taxRules: TaxRule[];
    version?: number | null;
  }) {
    this.id = config.id ?? null;
    this.description = config.description;
    this.countryReason = config.countryReason;
    this.countryCode = config.countryCode ?? '';
    this.lastModifiedDate = config.lastModifiedDate ?? new Date();
    this.currentRulesCount = config.currentRulesCount ?? 0;
    this.maxRulesCount = config.maxRulesCount ?? 0;
    this.taxRules = config.taxRules ?? [];
    this.version = config.version ?? null;
  }

  static create(config: {
    id?: number | null;
    description: string;
    countryReason: string;
    countryCode: string;
    lastModifiedDate: Date;
    currentRulesCount: number;
    maxRulesCount: number;
    taxRules: TaxRule[];
    version?: number | null;
  }): TaxConfig {
    if (!config.countryCode || config.countryCode.length <= 1) {
      throw new Error('Invalid country code');
    }

    return new TaxConfig(config);
  }

  addTaxRule(taxRule: TaxRule): void {
    if (taxRule.getIsLinear() && this.maxRulesCount <= this.taxRules.length) {
      throw new Error('Too many rules');
    }
    this.taxRules.push(taxRule);
    this.currentRulesCount++;
    this.lastModifiedDate = new Date();
  }

  removeTaxRule(taxRule: TaxRule): boolean {
    if (!this.getTaxRules().find((rule) => rule.getId() === taxRule.id)) {
      return false;
    }

    if (this.getTaxRules().length === 1) {
      throw new Error('Last rule in country config');
    }

    this.taxRules = this.taxRules.filter(
      (rule) => rule.getId() !== taxRule.getId(),
    );
    this.currentRulesCount--;
    this.lastModifiedDate = new Date();

    return true;
  }

  mapToEntity(): TaxConfigEntity {
    return {
      id: this.id as number,
      description: this.description,
      countryReason: this.countryReason,
      countryCode: this.countryCode,
      lastModifiedDate: this.lastModifiedDate,
      currentRulesCount: this.currentRulesCount,
      maxRulesCount: this.maxRulesCount,
      version: this.version ?? 1,
    };
  }

  static mapFromEntity(entity: TaxConfigEntityWithRules): TaxConfig {
    return TaxConfig.create({
      id: entity.id,
      description: entity.description,
      countryReason: entity.countryReason,
      countryCode: entity.countryCode,
      lastModifiedDate: entity.lastModifiedDate,
      currentRulesCount: entity.currentRulesCount,
      maxRulesCount: entity.maxRulesCount,
      taxRules: entity.taxRules.map((rule) => TaxRule.mapFromEntity(rule)),
      version: entity.version,
    });
  }

  public getCurrentRulesCount(): number {
    return this.currentRulesCount;
  }

  public getTaxRules(): TaxRule[] {
    return this.taxRules;
  }

  public getCountryCode(): string {
    return this.countryCode;
  }

  public equals(anotherTaxConfig: unknown): boolean {
    if (this === anotherTaxConfig) return true;
    if (!(anotherTaxConfig instanceof TaxConfig)) return false;
    return this.id === anotherTaxConfig.id;
  }

  public getId(): number {
    return this.id as number;
  }
}
