import {belongsTo,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Order} from './order.model';
import {User} from './user.model';

@model()
export class OrderTimeline extends Base {

  constructor(data?: Partial<OrderTimeline>) {
    super(data);
  }




  @belongsTo(() => Order)
  orderId: string;

  @property({
    type: "string"
  })
  action: string;
  @property({
    type: "string"
  })
  title: string;

  @belongsTo(() => User)
  staffId: string;
  @property({
    type: "string"
  })
  timelineKey: string;

}

export interface OrderTimelineRelations {
  // describe navigational properties here
}

export type OrderTimelineWithRelations = OrderTimeline & OrderTimelineRelations;
