import {hasOne,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {ShoppingCart} from './shopping-cart.model';

@model()
export class User extends Base {

  @property({
    type: 'string'
  })
  name: string;

  @property({
    type: 'string'
  })
  avatar:string;
  @property({
    type: 'string',
  })
  email:string;
  @property({
    type: 'string'
  })
   firebaseUserId:string


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
