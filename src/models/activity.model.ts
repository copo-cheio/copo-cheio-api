import {belongsTo,model,property} from '@loopback/repository';
import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {Event} from './event.model';
import {Place} from './place.model';
import {User} from './user.model';

@model()
export class Activity extends Base {
  @property({
    type: 'string',
    required: true,
  })
  action: string;

  @property({
    type: 'string',
    // required: true,
  })
  role: string;
  @property({
    type: 'string',
    // required: true,
  })
  job: string;

  @property({
    type: 'boolean',
    default: false
    // required: true,
  })
  complete: boolean;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => Event)
  eventId: string;

  @belongsTo(() => Balcony)
  balconyId: string;

  constructor(data?: Partial<Activity>) {
    super(data);
  }
}

export interface ActivityRelations {
  // describe navigational properties here
}

export type ActivityWithRelations = Activity & ActivityRelations;
