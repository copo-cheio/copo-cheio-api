import {model,property, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {User} from './user.model';
import {Place} from './place.model';
import {Event} from './event.model';

@model()
export class Activity extends Base {
  @property({
    type: 'string',
    required: true,
  })
  action: string;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => Event)
  eventId: string;

  constructor(data?: Partial<Activity>) {
    super(data);
  }
}

export interface ActivityRelations {
  // describe navigational properties here
}

export type ActivityWithRelations = Activity & ActivityRelations;
