import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Schedule} from './schedule.model';

@model()
export class DateTime extends Base {
  @property({
    type: 'date',
    required: true,
  })
  datetime: string;

  @property({
    type: 'string',
    required: true,
  })
  timezone: string;

  @property({
    type: 'string',
    required: false,
  })
  weekDay: number;

  @belongsTo(() => Schedule)
  scheduleId: string;

  constructor(data?: Partial<DateTime>) {
    super(data);
  }
}

export interface DateTimeRelations {
  // describe navigational properties here
}

export type DateTimeWithRelations = DateTime & DateTimeRelations;
