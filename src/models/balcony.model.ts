import {belongsTo,hasMany,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Image} from './image.model';
import {Menu} from './menu.model';
import {Order} from './order.model';
import {Place} from './place.model';

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

  constructor(data?: Partial<Balcony>) {
    super(data);
  }
}

export interface BalconyRelations {
  // describe navigational properties here
}

export type BalconyWithRelations = Balcony & BalconyRelations;
