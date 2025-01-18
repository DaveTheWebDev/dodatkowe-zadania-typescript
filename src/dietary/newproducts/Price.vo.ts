export class Price {
  static ZERO = Price.from(0);
  private constructor(private amount: number | null) {
    if (amount === null) {
      throw new Error('Invalid price');
    }
    this.amount = amount;
  }

  static from(amount: number | null): Price {
    return new Price(amount);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toInt(): number {
    return this.amount || 0;
  }
}
