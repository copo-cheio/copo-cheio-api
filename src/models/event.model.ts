import {belongsTo,hasMany,model,property} from '@loopback/repository';
import {Address} from './address.model';
import {Base} from './base.model';
import {EventRule} from './event-rule.model';
import {Image} from './image.model';
import {Place} from './place.model';
import {Rule} from './rule.model';
import {Schedule} from './schedule.model';
import {TagReferences} from './tag-references.model';
import {Tag} from './tag.model';
import {Ticket} from './ticket.model';
import {Playlist} from './playlist.model';
import {Lineup} from './lineup.model';

@model()
export class Event extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  webpage?: string;

  @property({
    type: 'number',
    required: true,
  })
  status: number;

  @belongsTo(() => Image)
  coverId: string;

  @hasMany(() => Tag, {through: {model: () => TagReferences, keyFrom: 'refId'}})
  tags: Tag[];

  @belongsTo(() => Address)
  addressId: string;

  @belongsTo(() => Place)
  placeId: string;

  @belongsTo(() => Schedule)
  scheduleId: string;

  @hasMany(() => Ticket, {keyTo: 'refId'})
  tickets: Ticket[];

  @hasMany(() => Rule, {through: {model: () => EventRule}})
  rules: Rule[];

  @belongsTo(() => Playlist)
  playlistId: string;

  @hasMany(() => Lineup)
  lineups: Lineup[];

  constructor(data?: Partial<Event>) {
    super(data);
  }
}

export interface EventRelations {
  // describe navigational properties here
}

export type EventWithRelations = Event & EventRelations;
