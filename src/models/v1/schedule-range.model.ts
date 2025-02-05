import {belongsTo,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {DateTime} from './date-time.model';
import {Schedule} from './schedule.model';

@model()
export class ScheduleRange extends Base {

  @property({
    type: 'string',
    required: true,
  })
  weekDay?: string;

  @belongsTo(() => DateTime)
  startId: string;

  @belongsTo(() => DateTime)
  endId: string;

  @belongsTo(() => Schedule)
  scheduleId: string;

  constructor(data?: Partial<ScheduleRange>) {
    super(data);
  }
}

export interface ScheduleRangeRelations {
  // describe navigational properties here
}

export type ScheduleRangeWithRelations = ScheduleRange & ScheduleRangeRelations;
