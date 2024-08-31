import {model, hasOne} from '@loopback/repository';
import {Base} from './base.model';
import {ShoppingCart} from './shopping-cart.model';

@model()
export class User extends Base {

  @hasOne(() => ShoppingCart)
  shoppingCart: ShoppingCart;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
