import {belongsTo,hasMany,model,property} from '@loopback/repository';
import {Address} from './address.model';
import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {Event} from './event.model';
import {Image} from './image.model';
import {Schedule} from './schedule.model';
import {TagReferences} from './tag-references.model';
import {Tag} from './tag.model';
import {Playlist} from './playlist.model';

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

  @hasMany(() => Tag, {through: {model: () => TagReferences, keyFrom: 'refId'}})
  tags: Tag[];

  @hasMany(() => Event)
  events: Event[];

  @belongsTo(() => Playlist)
  playlistId: string;

  constructor(data?: Partial<Place>) {
    console.log({data}, 'PLACE')
    super(data);
  }
}

export interface PlaceRelations {
  // describe navigational properties here
}

export type PlaceWithRelations = Place & PlaceRelations;
