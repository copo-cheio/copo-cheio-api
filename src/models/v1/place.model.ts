import {
  belongsTo,
  hasMany,
  hasOne,
  model,
  property,
  referencesMany,
} from '@loopback/repository';

import {CheckInV2} from '../check-in-v2.model';
import {Address} from './address.model';
import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {Contacts} from './contacts.model';
import {Event} from './event.model';
import {Image} from './image.model';
import {OpeningHours} from './opening-hours.model';
import {PlaceRule} from './place-rule.model';
import {Playlist} from './playlist.model';
import {Rule} from './rule.model';
import {Schedule} from './schedule.model';
import {Tag} from './tag.model';
import {Team} from './team.model';

@model()
export class Place extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  webpage?: string;

  @property({
    type: 'string',
  })
  phone?: string;

  @property({
    type: 'boolean',

    default: false,
  })
  live: boolean;

  @hasMany(() => Balcony, {keyTo: 'placeId'})
  balconies?: Balcony[];

  @belongsTo(() => Image)
  coverId: string;

  @belongsTo(() => Address)
  addressId: string;

  @belongsTo(() => Schedule)
  scheduleId: string;

  @hasMany(() => Event)
  events: Event[];

  @belongsTo(() => Playlist)
  playlistId: string;

  @hasMany(() => Rule, {through: {model: () => PlaceRule}})
  rules: Rule[];

  @referencesMany(() => Tag)
  tagIds: string[];

  @hasMany(() => OpeningHours)
  openingHours: OpeningHours[];

  @hasMany(() => Image, {keyTo: 'refId'})
  gallery: Image[];

  @hasOne(() => Contacts, {keyTo: 'refId'})
  contacts: Contacts;

  @belongsTo(() => Team)
  teamId: string;

  // @property(() => Company)
  @hasMany(() => CheckInV2)
  checkInsV2: CheckInV2[];
  // companyId: string;
  @property({
    type: 'string',
  })
  companyId: string;

  constructor(data?: Partial<Place>) {
    super(data);
  }
}

export interface PlaceRelations {
  // describe navigational properties here
}

export type PlaceWithRelations = Place & PlaceRelations;
