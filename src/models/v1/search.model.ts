import {belongsTo, model, property} from '@loopback/repository';
import {Base} from './base.model';
import {User} from './user.model';

@model()
export class Search extends Base {
  @property({
    type: 'string',
    required: true,
  })
  query: string;

  @property({
    type: 'number',
    required: true,
  })
  latitude: number;

  @property({
    type: 'number',
    required: true,
  })
  longitude: number;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
  })
  refId?: string;
  @property({
    type: 'string',
  })
  geoProvider?: string;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<Search>) {
    super(data);
  }
}

export interface SearchRelations {
  // describe navigational properties here
}

export type SearchWithRelations = Search & SearchRelations;
