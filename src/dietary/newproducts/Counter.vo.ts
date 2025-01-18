export class Counter {
  private counter: number;
  constructor(initialCounter: number | null) {
    if (initialCounter === null) {
      throw new Error('null counter');
    }
    if (initialCounter < 0) {
      throw new Error('Negative counter');
    }
    this.counter = initialCounter;
  }

  static from(counter: number | null): Counter {
    return new Counter(counter);
  }

  decrementCounter(): Counter {
    return Counter.from(this.counter - 1);
  }

  incrementCounter(): Counter {
    return Counter.from(this.counter + 1);
  }

  getIntValue(): number {
    return this.counter;
  }

  hasAny(): boolean {
    return this.counter > 0;
  }
}
