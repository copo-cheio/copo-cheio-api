import {belongsTo,hasMany,model,property} from '@loopback/repository';
import {Balcony} from './balcony.model';
import {Base} from './base.model';
import {Image} from './image.model';

@model()
export class Place extends Base {


  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @hasMany(() => Balcony, {keyTo: 'placeId'})
  balconies?: Balcony[];

  @belongsTo(() => Image)
  coverId: string;

  constructor(data?: Partial<Place>) {
    console.log({data}, 'PLACE')
    super(data);
  }
}

export interface PlaceRelations {
  // describe navigational properties here
}

export type PlaceWithRelations = Place & PlaceRelations;
