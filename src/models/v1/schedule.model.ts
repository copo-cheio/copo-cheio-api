import {hasMany, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {DateTime} from './date-time.model';
import {ScheduleRange} from './schedule-range.model';

@model()
export class Schedule extends Base {
  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @hasMany(() => DateTime)
  dateTimes: DateTime[];

  @hasMany(() => ScheduleRange)
  scheduleRanges: ScheduleRange[];

  constructor(data?: Partial<Schedule>) {
    super(data);
  }
}

export interface ScheduleRelations {
  // describe navigational properties here
}

export type ScheduleWithRelations = Schedule & ScheduleRelations;
