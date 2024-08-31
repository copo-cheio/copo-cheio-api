import {model, hasMany, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {CartItem} from './cart-item.model';
import {User} from './user.model';
import {Place} from './place.model';

@model()
export class Order extends Base {

  @hasMany(() => CartItem)
  cartItems: CartItem[];

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Place)
  placeId: string;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
