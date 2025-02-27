import {hasMany, hasOne, model, property} from '@loopback/repository';
import {IUser} from 'loopback4-soft-delete';
import {ActivityV2} from '../activity-v2.model';
import {CheckInV2} from '../check-in-v2.model';
import {OrderV2} from '../order-v2.model';
import {Base} from './base.model';
import {Favorite} from './favorite.model';
import {ShoppingCart} from './shopping-cart.model';

@model({
  settings: {
    hiddenProperties: ['email', 'firebaseUserId', 'pushNotificationToken'],
  },
})
export class User extends Base implements IUser {
  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  avatar: string;
  @property({
    type: 'string',
  })
  email: string;
  @property({
    type: 'string',
  })
  firebaseUserId: string;

  @property({
    type: 'string',
  })
  pushNotificationToken: string;

  @hasOne(() => ShoppingCart)
  shoppingCart: ShoppingCart;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  latitude: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  longitude: number;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

  @hasMany(() => Favorite)
  favorites: Favorite[];

  @hasMany(() => OrderV2)
  ordersV2: OrderV2[];

  @hasOne(() => CheckInV2)
  checkInV2: CheckInV2;

  @hasMany(() => ActivityV2)
  activitiesV2: ActivityV2[];

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
