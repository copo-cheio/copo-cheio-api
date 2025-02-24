import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {EventInstance} from './event-instance.model';
import {Place} from './place.model';

@model()
export class PlaceInstance extends Base {
  @property({
    type: 'number',
    required: true,
  })
  dayofweek: number;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'date',
    required: true,
  })
  startDate: Date;

  @property({
    type: 'date',
    required: true,
  })
  endDate: Date;

  @property({
    type: 'boolean',
    default: false,
  })
  active?: boolean;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => EventInstance)
  eventInstanceId?: string;

  constructor(data?: Partial<PlaceInstance>) {
    super(data);
  }
}

export interface PlaceInstanceRelations {
  // describe navigational properties here
}

export type PlaceInstanceWithRelations = PlaceInstance & PlaceInstanceRelations;
