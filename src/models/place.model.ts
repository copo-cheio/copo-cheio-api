import {belongsTo,hasMany,model,property, referencesMany} from '@loopback/repository';
import {Address} from './address.model';
import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {Event} from './event.model';
import {Image} from './image.model';
import {PlaceRule} from './place-rule.model';
import {Playlist} from './playlist.model';
import {Rule} from './rule.model';
import {Schedule} from './schedule.model';
import {Tag} from './tag.model';

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

  constructor(data?: Partial<Place>) {
    // console.log({data}, 'PLACE')
    super(data);
  }
}

export interface PlaceRelations {
  // describe navigational properties here
}

export type PlaceWithRelations = Place & PlaceRelations;
