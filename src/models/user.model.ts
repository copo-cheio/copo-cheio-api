import {hasOne,model,property} from '@loopback/repository';
import {SoftDeleteEntity} from 'loopback4-soft-delete';
import {ShoppingCart} from './shopping-cart.model';

@model()
export class User extends SoftDeleteEntity {

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


  @property({
    type: 'string',
    id: true,
    generated: true,
    useDefaultIdType: false,
    postgresql: {
      dataType: 'uuid',
      extension: 'pgcrypto',
      defaultFn: 'gen_random_uuid()', //<---- only this line is different
    },

  })
  id?: string;

  @property({
    type: 'date',
    generated: true,
    jsonSchema: {
      format: 'date-time',
    },
    defaultFn: 'now',
  })
  created_at ? : Date;

  @property({
    type: 'date',
    generated: true,
    jsonSchema: {
      format: 'date-time',
    },
    defaultFn: 'now',
  })
  updated_at ? : Date;



  // isDeleted: boolean

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;



  getIdentifier() {
    return this.id;
  }


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
