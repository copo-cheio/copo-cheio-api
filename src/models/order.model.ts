import {belongsTo,hasMany,model,property, hasOne} from '@loopback/repository';
import {Base} from './base.model';
import {CartItem} from './cart-item.model';
import {Place} from './place.model';
import {User} from './user.model';
import {Image} from './image.model';

@model()
export class Order extends Base {

  @property({
    type: 'string',
  })
  code: string;


  @property({
    type: "number",
    required: true,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  totalPrice: string;


  @property({
    type: 'string',
  })
  itemCount: string;


  @property({
    type: "number",
    required: true,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  fees: string;



  @property({
    type: 'string',
  })
  paymentId: string;



  @hasMany(() => CartItem)
  cartItems: CartItem[];

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Place)
  placeId: string;

  @hasOne(() => Image)
  qr: Image;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
