import {model, property} from '@loopback/repository';
import {Base} from './v1';

@model()
export class OrderDetailsV2 extends Base {
  @property({
    type: 'number',
    required: true,
  })
  productCount: number;

  @property({
    type: 'number',
    required: true,
  })
  productsPrice: number;

  @property({
    type: 'number',
    required: true,
  })
  serviceFee: number;

  @property({
    type: 'number',
    required: true,
  })
  totalPrice: number;

  constructor(data?: Partial<OrderDetailsV2>) {
    super(data);
  }
}

export interface OrderDetailsV2Relations {
  // describe navigational properties here
}

export type OrderDetailsV2WithRelations = OrderDetailsV2 &
  OrderDetailsV2Relations;
