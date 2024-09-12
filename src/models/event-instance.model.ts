import {belongsTo,model,property} from '@loopback/repository';
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


  @property({
    type: 'number',
    // required: true,
  })
  latitude: number;  // Store the latitude of the event

  @property({
    type: 'number',
    // required: true,
  })
  longitude: number;  // Store the longitude of the event

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
