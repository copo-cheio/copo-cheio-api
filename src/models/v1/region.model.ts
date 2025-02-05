import {belongsTo,model,property} from '@loopback/repository';
import {Base} from './base.model';
import {Country} from './country.model';
/*
[
  {
    "id": "c5fe7d21-f49b-49ee-8382-1664bb8afe3d",
    "name": "Lisboa",
    "countryId": "11e0d86d-fd1c-4984-b329-0206ebd36d59"
  }
]
 */
@model()
export class Region extends Base {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @belongsTo(() => Country)
  countryId: string;

  constructor(data?: Partial<Region>) {
    super(data);
  }
}

export interface RegionRelations {
  // describe navigational properties here
}

export type RegionWithRelations = Region & RegionRelations;
