import { OldProduct } from '@dietary/newproducts/OldProduct';
import { describe, test, expect } from 'vitest';
describe('OldProduct', () => {
  function productWith({
    price,
    counter,
    desc = 'desc',
    longDesc = 'longDesc',
  }: {
    price: number | null;
    desc?: string;
    longDesc?: string;
    counter: number | null;
  }): OldProduct {
    return new OldProduct(price, desc, longDesc, counter);
  }
  test('price can not be null', () => {
    expect(() => new OldProduct(null, 'desc', 'longDesc', 10)).toThrow(
      'Invalid price',
    );
  });
  test('can increment counter if price is positive', () => {
    // Given
    const product = productWith({ price: 10, counter: 10 });
    // When
    product.incrementCounter();
    // Then
    expect(product.counterNumber).toBe(11);
  });
  test('can not increment counter if price is not positive', () => {
    // Given
    const product = productWith({ price: 0, counter: 10 });
    // Expect
    expect(() => product.incrementCounter()).toThrow('Invalid price');
  });
  test('can decrement counter if price is positive', () => {
    // Given
    const product = productWith({ price: 10, counter: 10 });
    // When
    product.decrementCounter();
    // Then
    expect(product.counterNumber).toBe(9);
  });
  test('can not decrement counter if price is not positive', () => {
    // Given
    const product = productWith({ price: 0, counter: 0 });
    // Expect
    expect(() => product.decrementCounter()).toThrow('Invalid price');
  });
  test('can change price if counter is positive', () => {
    // Given
    const product = productWith({ price: 0, counter: 10 });
    // When
    product.changePriceTo(10);
    // Then
    expect(product.priceAmount).toBe(10);
  });
  test('can not change price if counter is not positive', () => {
    // Given
    const product = productWith({ price: 0, counter: 0 });
    // When
    product.changePriceTo(10);
    // Then
    expect(product.priceAmount).toBe(0);
  });
  test('can format description', () => {
    // Expect
    expect(
      productWith({
        desc: 'short',
        longDesc: 'long',
        price: 10,
        counter: 10,
      }).formatDesc(),
    ).toBe('short *** long');

    expect(
      productWith({
        desc: 'short',
        longDesc: '',
        price: 10,
        counter: 10,
      }).formatDesc(),
    ).toBe('');

    expect(
      productWith({
        desc: '',
        longDesc: 'long',
        price: 10,
        counter: 10,
      }).formatDesc(),
    ).toBe('');
  });
  test('can change char in description', () => {
    // Given
    const product = productWith({
      desc: 'short',
      longDesc: 'long',
      price: 10,
      counter: 10,
    });
    // When
    product.replaceCharFromDesc('s', 'z');
    // Expect
    expect(product.formatDesc()).toBe('zhort *** long');
  });
});
