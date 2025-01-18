import { CustomerType } from './CustomerType.enum';

export interface CustomerOrderGroup {
  getCustomer(): { getType(): CustomerType };
}
