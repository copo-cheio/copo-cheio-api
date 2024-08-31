import {model} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class OrderItem extends Base {

  constructor(data?: Partial<OrderItem>) {
    super(data);
  }
}

export interface OrderItemRelations {
  // describe navigational properties here
}

export type OrderItemWithRelations = OrderItem & OrderItemRelations;
