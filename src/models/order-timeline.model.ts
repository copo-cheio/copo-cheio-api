import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class OrderTimeline extends Base {

  constructor(data?: Partial<OrderTimeline>) {
    super(data);
  }

  @property({
    type:"string"
  })
  action:string;
}

export interface OrderTimelineRelations {
  // describe navigational properties here
}

export type OrderTimelineWithRelations = OrderTimeline & OrderTimelineRelations;
