import {model, property} from '@loopback/repository';
import {BaseModel} from '.';

@model()
export class Place extends BaseModel {
  @property({
    type: 'string',
    required: true,
  })
  name: string;


  constructor(data?: Partial<Place>) {
    super(data);
  }
}

export interface PlaceRelations {
  // describe navigational properties here
}

export type PlaceWithRelations = Place & PlaceRelations;
