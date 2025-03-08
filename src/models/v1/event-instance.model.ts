import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {Event} from './event.model';
import {Place} from './place.model';
import {Team} from './team.model';

@model()
export class EventInstance extends Base {
  @property({
    type: 'date',
    required: true,
  })
  startDate: Date;

  @property({
    type: 'date',
  })
  endDate?: Date;
  @property({
    type: 'date',
  })
  date?: Date;

  @property({
    type: 'number',
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
    type: 'number',
    required: true,
    postgresql: {
      dataType: 'NUMERIC', // Explicitly specify NUMERIC
      precision: 10, // Total number of digits
      scale: 2, // Number of digits after the decimal point
      default: 0, // Default value of 0 in PostgreSQL
    },
  })
  longitude: number;

  @property({
    type: 'object',
    default: {},
  })
  configuration: any;

  @belongsTo(() => Event)
  eventId: string;

  @belongsTo(() => Team)
  teamId: string;

  @belongsTo(() => Place)
  placeId: string;

  constructor(data?: Partial<EventInstance>) {
    super(data);
  }
}

export interface EventInstanceRelations {
  // describe navigational properties here
}

export type EventInstanceWithRelations = EventInstance & EventInstanceRelations;
