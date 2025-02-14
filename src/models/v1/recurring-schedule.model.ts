import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Event} from './event.model';

@model()
export class RecurringSchedule extends Base {
  @property({
    type: 'number',
    required: true,
  })
  frequency: number;

  @property({
    type: 'string',
    required: true,
  })
  frequencyUnit: string;

  @property({
    type: 'date',
    required: true,
  })
  recurrenceStart: string;

  @property({
    type: 'date',
    required: true,
  })
  recurrenceEnd: string;

  @belongsTo(() => Event)
  eventId: string;

  constructor(data?: Partial<RecurringSchedule>) {
    super(data);
  }
}

export interface RecurringScheduleRelations {
  // describe navigational properties here
}

export type RecurringScheduleWithRelations = RecurringSchedule &
  RecurringScheduleRelations;
