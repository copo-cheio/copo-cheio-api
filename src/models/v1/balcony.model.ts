import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {CheckInV2} from '../check-in-v2.model';
import {OrderV2} from '../order-v2.model';
import {Base} from './base.model';
import {Image} from './image.model';
import {Menu} from './menu.model';
import {Order} from './order.model';
import {Place} from './place.model';
import {Stock} from './stock.model';

@model()
export class Balcony extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;
  @property({
    type: 'string',
  })
  description: string;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => Image)
  coverId: string;

  @belongsTo(() => Menu)
  menuId: string;

  @hasMany(() => Order)
  orders: Order[];

  @hasMany(() => Stock)
  stocks: Stock[];

  @hasMany(() => OrderV2)
  ordersV2: OrderV2[];

  @hasMany(() => CheckInV2)
  checkInsV2: CheckInV2[];

  constructor(data?: Partial<Balcony>) {
    super(data);
  }
}

export interface BalconyRelations {
  // describe navigational properties here
}

export type BalconyWithRelations = Balcony & BalconyRelations;
