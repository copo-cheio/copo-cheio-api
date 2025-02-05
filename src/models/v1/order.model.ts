import {belongsTo,hasMany,hasOne,model,property} from '@loopback/repository';
import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {CartItem} from './cart-item.model';
import {Event} from './event.model';
import {Image} from './image.model';
import {OrderItem} from './order-item.model';
import {OrderTimeline} from './order-timeline.model';
import {Place} from './place.model';
import {Price} from './price.model';
import {User} from './user.model';

export const ORDER_READY_STATUS = "READY"
export const ORDER_COMPLETE_STATUS = "COMPLETE"
export const ORDER_STATUS = ["WAITING_PAYMENT",
  "FAILED",
  "PENDING",
  "ONHOLD",
  "ONGOING",
  ORDER_READY_STATUS,
  ORDER_COMPLETE_STATUS]


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
  @property({
    type: 'string',
    default: "WAITING_PAYMENT" // FAILED ONHOLD ONGOING READY COMPLETE
  })
  status?: string;



  @hasMany(() => CartItem)
  cartItems: CartItem[];

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Place)
  placeId: string;

  @hasOne(() => Image)
  qr: Image;

  @belongsTo(() => Event)
  eventId: string;

  @belongsTo(() => Balcony)
  balconyId: string;

  @hasMany(() => OrderItem)
  orderItems: OrderItem[];

  @belongsTo(() => Price)
  priceId: string;

  @hasMany(() => OrderTimeline)
  orderTimelines: OrderTimeline[];

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
