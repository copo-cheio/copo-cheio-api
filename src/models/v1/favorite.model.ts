import {model, belongsTo} from '@loopback/repository';
import {Base} from './base.model';
import {User} from './user.model';
import {Event} from './event.model';
import {Place} from './place.model';

@model()
export class Favorite extends Base {

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Event)
  eventId: string;

  @belongsTo(() => Place)
  placeId: string;

  constructor(data?: Partial<Favorite>) {
    super(data);
  }
}

export interface FavoriteRelations {
  // describe navigational properties here
}

export type FavoriteWithRelations = Favorite & FavoriteRelations;
