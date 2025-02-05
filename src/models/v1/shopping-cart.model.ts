import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class ShoppingCart extends Base {

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<ShoppingCart>) {
    super(data);
  }
}

export interface ShoppingCartRelations {
  // describe navigational properties here
}

export type ShoppingCartWithRelations = ShoppingCart & ShoppingCartRelations;
