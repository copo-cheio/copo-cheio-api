import {model,property, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {Event} from './event.model';

@model()
export class EventInstance extends Base {
  @property({
    type: 'date',
    required: true,
  })
  startDate: string;

  @property({
    type: 'date',
  })
  endDate?: string;

  @belongsTo(() => Event)
  eventId: string;

  constructor(data?: Partial<EventInstance>) {
    super(data);
  }
}

export interface EventInstanceRelations {
  // describe navigational properties here
}

export type EventInstanceWithRelations = EventInstance & EventInstanceRelations;
