import {model} from '@loopback/repository';
import {Base} from '../v1';

@model()
export class OrderItemsV2 extends Base {
  constructor(data?: Partial<OrderItemsV2>) {
    super(data);
  }
}

export interface OrderItemsV2Relations {
  // describe navigational properties here
}

export type OrderItemsV2WithRelations = OrderItemsV2 & OrderItemsV2Relations;
