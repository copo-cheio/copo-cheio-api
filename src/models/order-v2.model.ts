import {
  belongsTo,
  hasMany,
  hasOne,
  model,
  property,
} from '@loopback/repository';
import {OrderDetailsV2} from './order-details-v2.model';
import {OrderItemsV2} from './order-items-v2.model';
import {Balcony, Price} from './v1';
import {Base} from './v1/base.model';
import {Event} from './v1/event.model';
import {Place} from './v1/place.model';

import {Image} from './v1/image.model';
import {OrderTimeline} from './v1/order-timeline.model';
import {User} from './v1/user.model';

@model()
export class OrderV2 extends Base {
  @property({
    type: 'string',
    required: true,
    defaultValue: 'WAITING_PAYMENT',
  })
  status: string;

  @property({
    type: 'string',
    required: false,
    hidden: true,
  })
  code: string;

  @belongsTo(() => Balcony)
  balconyId: string;

  @hasOne(() => OrderDetailsV2, {name: 'details', keyTo: 'orderV2Id'})
  details: OrderDetailsV2;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => User, {
    name: 'userV2',
    keyFrom: 'userUid',
    keyTo: 'firebaseUserId',
  })
  userUid: string; // This is mapped to `user.uid` instead of `user.id`

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => Event)
  eventId: string;

  @belongsTo(() => Price)
  priceId: string;

  @hasMany(() => OrderItemsV2)
  items: OrderItemsV2[];

  @hasMany(() => OrderTimeline)
  orderTimelines: OrderTimeline[];

  @hasOne(() => Image, {name: 'qrCode', keyFrom: 'id', keyTo: 'refId'})
  qrCode: Image;

  constructor(data?: Partial<OrderV2>) {
    super(data);
  }

  /*   userId
   *   placeId
   *   balconyId
   *   eventId
   *   status
   *   code
   *   orderInfoId -> refers to orderInfoId
   *   paymentId ->  */
}

export interface OrderV2Relations {
  // describe navigational properties here
}

export type OrderV2WithRelations = OrderV2 & OrderV2Relations;
