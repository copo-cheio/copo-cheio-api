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
    type: "number",
    required: true,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  latitude: number;

  @property({
    type: "number",
    required: true,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  longitude: number;

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
