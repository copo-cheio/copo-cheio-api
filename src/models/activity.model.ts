import {belongsTo,model,property} from '@loopback/repository';
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
    required: true,
  })
  role: string;

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
