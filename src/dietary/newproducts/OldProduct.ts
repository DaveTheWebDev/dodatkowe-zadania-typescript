import { UUID } from '@utils/uuid';
import { Price } from './Price.vo';
import { Description } from './Description.vo';
import { Counter } from './Counter.vo';

export class OldProduct {
  serialNumber = UUID.randomUUID();
  private price: Price;
  private desc: Description;
  private counter: Counter;
  constructor(
    price: number | null,
    desc: string,
    longDesc: string,
    counter: number | null,
  ) {
    this.price = Price.from(price);
    this.desc = Description.from(desc, longDesc);
    this.counter = Counter.from(counter);
  }
  decrementCounter(): void {
    if (this.price.isZero()) {
      throw new Error('Invalid price');
    }
    this.counter = this.counter.decrementCounter();
  }
  incrementCounter(): void {
    if (this.price.isZero()) {
      throw new Error('Invalid price');
    }
    this.counter = this.counter.incrementCounter();
  }
  changePriceTo(newPrice: number | null): void {
    if (this.counter.hasAny()) {
      this.price = Price.from(newPrice);
    }
  }
  replaceCharFromDesc(charToReplace: string, replaceWith: string): void {
    this.desc.replaceCharFromDesc(charToReplace, replaceWith);
  }
  formatDesc(): string {
    return this.desc.formatDesc();
  }
  get priceAmount(): number {
    return this.price.toInt();
  }
  get counterNumber(): number {
    return this.counter.getIntValue();
  }
  get description(): string {
    return this.desc.formatDesc();
  }
}
