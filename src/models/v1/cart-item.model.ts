import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class CartItem extends Base {

  @property({
    type: 'string',
  })
  orderId?: string;

  constructor(data?: Partial<CartItem>) {
    super(data);
  }
}

export interface CartItemRelations {
  // describe navigational properties here
}

export type CartItemWithRelations = CartItem & CartItemRelations;
