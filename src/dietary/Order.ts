import { CustomerOrderGroup } from './CustomerOrderGroup';
import { OrderLine } from './OrderLine';
import { OrderState } from './OrderState.enum';
import { OrderType } from './OrderType.enum';
import { TaxRule } from './TaxRule';

export class Order {
  private id: number;
  private orderState: OrderState;
  private orderType: OrderType;
  private customerOrderGroup: CustomerOrderGroup;
  private items: OrderLine[];
  private taxRules: TaxRule[];
  private confirmationTimestamp: Date;

  constructor() {
    this.id = 0;
    this.orderState = OrderState.Initial;
    this.orderType = OrderType.Phone;
    this.customerOrderGroup = {} as CustomerOrderGroup;
    this.items = [];
    this.taxRules = [];
    this.confirmationTimestamp = new Date();
  }

  public getId(): number {
    return this.id;
  }

  public getConfirmationTimestamp(): Date {
    return this.confirmationTimestamp;
  }

  public getOrderState(): OrderState {
    return this.orderState;
  }

  public setOrderState(orderState: OrderState): void {
    this.orderState = orderState;
  }

  public getOrderType(): OrderType {
    return this.orderType;
  }

  public setOrderType(orderType: OrderType): void {
    this.orderType = orderType;
  }

  public getCustomerOrderGroup(): CustomerOrderGroup {
    return this.customerOrderGroup;
  }

  public setCustomerOrderGroup(customerOrderGroup: CustomerOrderGroup): void {
    this.customerOrderGroup = customerOrderGroup;
  }

  public getTaxRules(): TaxRule[] {
    return this.taxRules;
  }

  public setTaxRules(taxRules: TaxRule[]): void {
    this.taxRules = taxRules;
  }

  public getItems(): OrderLine[] {
    return this.items;
  }

  public setItems(items: OrderLine[]): void {
    this.items = items;
  }
}
