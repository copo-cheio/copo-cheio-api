import {model, property} from '@loopback/repository';
import {Base} from './v1';

@model()
export class OrderV2 extends Base {
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

  constructor(data?: Partial<OrderV2>) {
    super(data);
  }
}

export interface OrderV2Relations {
  // describe navigational properties here
}

export type OrderV2WithRelations = OrderV2 & OrderV2Relations;
