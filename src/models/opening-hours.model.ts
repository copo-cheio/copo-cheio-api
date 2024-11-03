import {model,property} from '@loopback/repository';
import {Base} from './base.model';

@model()
export class OpeningHours extends Base {
  @property({
    type: 'number',
    required: true,
  })
  dayofweek: number;

  @property({
    type: 'string',
    required: true,
  })
  openhour: string;

  @property({
    type: 'string',
    required: true,
  })
  closehour: string;

  @property({
    type: 'string',
  })
  placeId?: string;

  @property({
    type: 'string',
  })
  eventId?: string;

   @property({
     type: 'boolean',
     default:false,

   })
   active?: boolean

  constructor(data?: Partial<OpeningHours>) {
    super(data);
  }
}

export interface OpeningHoursRelations {
  // describe navigational properties here
}

export type OpeningHoursWithRelations = OpeningHours & OpeningHoursRelations;
