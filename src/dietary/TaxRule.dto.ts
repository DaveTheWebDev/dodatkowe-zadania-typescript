import { TaxRule } from './TaxRule';

export class TaxRuleDto {
  public formattedTaxCode: string;
  private id: number | null;
  private isLinear: boolean;
  private aFactor: number;
  private bFactor: number;
  private isSquare: boolean;
  private aSquareFactor: number;
  private bSquareFactor: number;
  private cSquareFactor: number;

  constructor(taxRule: TaxRule) {
    this.id = taxRule.getId();
    this.formattedTaxCode = ` informal 671 ${taxRule.getTaxCode()} *** `;
    this.isLinear = taxRule.getIsLinear();
    this.aFactor = taxRule.getAFactor() ?? 0;
    this.bFactor = taxRule.getBFactor() ?? 0;
    this.isSquare = taxRule.getIsSquare();
    this.aSquareFactor = taxRule.getASquareFactor() ?? 0;
    this.bSquareFactor = taxRule.getBSquareFactor() ?? 0;
    this.cSquareFactor = taxRule.getBSquareFactor() ?? 0;
  }

  public getIsLinear(): boolean {
    return this.isLinear;
  }

  public setIsLinear(linear: boolean): void {
    this.isLinear = linear;
  }

  public getAFactor(): number {
    return this.aFactor;
  }

  public setAFactor(aFactor: number): void {
    this.aFactor = aFactor;
  }

  public getBFactor(): number {
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

  public getASquareFactor(): number {
    return this.aSquareFactor;
  }

  public setASquareFactor(aSquareFactor: number): void {
    this.aSquareFactor = aSquareFactor;
  }

  public getBSquareFactor(): number {
    return this.bSquareFactor;
  }

  public setBSquareFactor(bSquareFactor: number): void {
    this.bSquareFactor = bSquareFactor;
  }

  public getCSquareFactor(): number {
    return this.cSquareFactor;
  }

  public setCSquareFactor(cSquareFactor: number): void {
    this.cSquareFactor = cSquareFactor;
  }

  public equals(o: unknown): boolean {
    if (this === o) return true;
    if (!(o instanceof TaxRuleDto)) return false;
    const taxRule = o;
    return this.id === taxRule.id;
  }

  public hashCode(): number | null {
    return this.id;
  }
}
