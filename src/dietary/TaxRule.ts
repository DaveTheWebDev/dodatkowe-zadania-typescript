import { TaxConfig } from './TaxConfig';
import { taxRulePolicies } from './TaxRule.policies';
import { taxRuleResolver } from './TaxRule.resolver';
import { TaxRuleEntity } from './TaxRule.schema';

export class TaxRule {
  id: number | null;
  taxCode: string;
  version: number | null;
  private isLinear: boolean;
  private aFactor: number | null;
  private bFactor: number | null;
  private isSquare: boolean;
  private aSquareFactor: number | null;
  private bSquareFactor: number | null;
  private cSquareFactor: number | null;
  private taxConfigId: number | null;

  private constructor(rule: {
    id?: number | null;
    taxCode: string;
    aFactor: number | null;
    bFactor: number | null;
    cFactor?: number | null;
    isLinear: boolean;
    isSquare: boolean;
    aSquareFactor: number | null;
    bSquareFactor: number | null;
    cSquareFactor: number | null;
    taxConfigId?: number | null;
    version?: number | null;
  }) {
    this.id = rule.id ?? null;
    this.taxCode = rule.taxCode;
    this.taxConfigId = rule.taxConfigId ?? null;
    this.version = rule.version ?? null;
    this.isLinear = rule.isLinear;
    this.aFactor = rule.aFactor;
    this.bFactor = rule.bFactor;
    this.isSquare = rule.isSquare;
    this.aSquareFactor = rule.aSquareFactor;
    this.bSquareFactor = rule.bSquareFactor;
    this.cSquareFactor = rule.cSquareFactor;
  }

  static create(rule: {
    id?: number | null;
    taxCode: string;
    aFactor: number | null;
    bFactor: number | null;
    cFactor?: number | null;
    isLinear?: boolean | null;
    isSquare?: boolean | null;
    aSquareFactor?: number | null;
    bSquareFactor?: number | null;
    cSquareFactor?: number | null;
    taxConfigId?: number | null;
    version?: number | null;
  }): TaxRule {
    const policy = taxRuleResolver({
      a: rule.aFactor || (rule.aSquareFactor as number | null),
      b: rule.bFactor || (rule.bSquareFactor as number | null),
      c: rule.cFactor,
    });
    const properties = taxRulePolicies[policy](
      rule.aFactor,
      rule.bFactor,
      rule.cFactor ?? 0,
    );

    return new TaxRule({
      id: rule.id ?? null,
      taxCode: rule.taxCode,
      taxConfigId: rule.taxConfigId ?? null,
      version: rule.version ?? null,
      isLinear: properties.isLinear,
      aFactor: properties.aFactor,
      bFactor: properties.bFactor,
      isSquare: properties.isSquare,
      aSquareFactor: properties.aSquareFactor,
      bSquareFactor: properties.bSquareFactor,
      cSquareFactor: properties.cSquareFactor,
    });
  }

  static mapFromEntity(rule: TaxRuleEntity): TaxRule {
    return new TaxRule({
      id: rule.id,
      taxCode: rule.taxCode,
      taxConfigId: rule.taxConfigId,
      version: rule.version,
      isLinear: rule.isLinear as boolean,
      aFactor: rule.aFactor,
      bFactor: rule.bFactor,
      isSquare: rule.isSquare as boolean,
      aSquareFactor: rule.aSquareFactor,
      bSquareFactor: rule.bSquareFactor,
      cSquareFactor: rule.cSquareFactor,
    });
  }

  mapToEntity(taxConfigId: TaxConfig['id']): TaxRuleEntity {
    return {
      id: this.id as number,
      taxCode: this.taxCode,
      taxConfigId: taxConfigId!,
      version: this.version ?? 1,
      isLinear: this.isLinear,
      aFactor: this.aFactor,
      bFactor: this.bFactor,
      isSquare: this.isSquare,
      aSquareFactor: this.aSquareFactor,
      bSquareFactor: this.bSquareFactor,
      cSquareFactor: this.cSquareFactor,
    };
  }

  public getIsLinear(): boolean {
    return this.isLinear;
  }

  public setIsLinear(linear: boolean): void {
    this.isLinear = linear;
  }

  public getAFactor(): number | null {
    return this.aFactor;
  }

  public setAFactor(aFactor: number): void {
    this.aFactor = aFactor;
  }

  public getBFactor(): number | null {
    return this.bFactor;
  }

  public setBFactor(bFactor: number): void {
    this.bFactor = bFactor;
  }

  public getIsSquare(): boolean {
    return this.isSquare;
  }

  public setIsSquare(square: boolean): void {
    this.isSquare = square;
  }

  public getASquareFactor(): number | null {
    return this.aSquareFactor;
  }

  public setASquareFactor(aSquareFactor: number): void {
    this.aSquareFactor = aSquareFactor;
  }

  public getBSquareFactor(): number | null {
    return this.bSquareFactor;
  }

  public setBSquareFactor(bSquareFactor: number): void {
    this.bSquareFactor = bSquareFactor;
  }

  public getCSquareFactor(): number | null {
    return this.cSquareFactor;
  }

  public setCSquareFactor(cSquareFactor: number): void {
    this.cSquareFactor = cSquareFactor;
  }

  public setTaxCode(taxCode: string): void {
    this.taxCode = taxCode;
  }

  public equals(o: unknown): boolean {
    if (this === o) return true;
    if (!(o instanceof TaxRule)) return false;
    const that = o;
    return this.taxCode === that.getTaxCode();
  }

  public hashCode(): number {
    return this.taxCode.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  public getTaxCode(): string {
    return this.taxCode;
  }

  public getId(): number {
    return this.id as number;
  }

  public getVersion(): number | null {
    return this.version;
  }

  public getTaxConfigId(): number {
    return this.taxConfigId as number;
  }

  public setTaxConfigId(taxConfigId: number): void {
    this.taxConfigId = taxConfigId;
  }
}
