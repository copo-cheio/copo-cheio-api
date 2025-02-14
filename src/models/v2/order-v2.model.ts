/* import {belongsTo, model, property} from '@loopback/repository';
import {Base} from '../v1';
import {Balcony} from '../v1/balcony.model';

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
  })
  code: string;

  @belongsTo(() => Balcony)
  balconyId: string;

  constructor(data?: Partial<OrderV2>) {
    super(data);
  }
}

export interface OrderV2Relations {
  // describe navigational properties here
}

export type OrderV2WithRelations = OrderV2 & OrderV2Relations;
 */
