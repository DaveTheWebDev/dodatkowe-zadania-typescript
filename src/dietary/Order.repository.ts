import { Order } from './Order';
import { OrderState } from './OrderState.enum';

export interface OrderRepository {
  findByOrderState(orderState: OrderState): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  save(order: Order): Promise<Order>;
}
